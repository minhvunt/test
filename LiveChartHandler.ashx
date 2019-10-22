<%@ WebHandler Language="C#" Class="AG.LiveChartHandler" %>

using System;
using System.Configuration;
using System.Data;
using System.IO;
using System.Net;
using System.Text;
using System.Web;
using Microsoft.ApplicationBlocks.Data;
using WebSpiderLib;

namespace AG
{
    public class LiveChartHandler : IHttpHandler
    {
        public static LiveChart Singleton;

        #region IHttpHandler Members

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            if (Singleton == null)
                Singleton = new LiveChart();
            string strResult = "";
            if (context.Request["sbs"] != null && context.Request["sbsSymbols"] != null)
            {
                string strSymbols = context.Request["sbsSymbols"];
                strResult = Singleton.GetSBSData(strSymbols);                
            }
            else if (context.Request["type"] != null)
            {
                try
                {
                    strResult = Singleton.GetIndexData();
                }
                catch
                {
                }
            }
            context.Response.Write(strResult);
        }

        public bool IsReusable
        {
            get { return false; }
        }

        #endregion
    }

    public class LiveChart
    {
        private readonly string m_strConnectionString;
        private string m_strDatabaseOwner;
        private string m_strObjectQualifier;
        
        public LiveChart()
        {
            m_strConnectionString = ConfigurationManager.AppSettings["CNN_STR"];
            m_strObjectQualifier = "dnn_";
            m_strDatabaseOwner = "dbo.";
            //Uncomment the following line if using designed components 
            //InitializeComponent(); 
        }
        
        public string GetSBSData(string Symbols)
        {
            string result = "";
            //Lay rieng du lieu cho SBS
            /*
             *  VN-INDEX	127.746.391	590,69	+1,34	+0,23%
                HNX-INDEX	55.119.680	78,92	-0,52	-0,65%
                UPCOM-INDEX	832.681	47,17	+0,15	+0,32%
                VN30	35.622.750	636,75	+5,73	+0,91%
                HNX30	33.036.500	160,38	-1,00	-0,62%
                STB	568.250	20,50	+0,10	+0,49%
                SBS	146.110	3,70	0,00	0,00%
                SCR	5.191.403	9,20	0,00	0,00%
             * */
            //Lay Index ra truoc
            //http://stockboard.sbsc.com.vn/HO.ashx?FileName=indexVN30
            //0 - 606.70;-1.03;-0.17;94020496;1917.710;95;63;125;36599;10;2|
            //1 - 607.95;0.22;0.04;1914870;35.087;1309|
            //2 - 608.47;0.74;0.12;78106210;1397.686;32307|
            //3 - 606.70;-1.03;-0.17;12753420;393.413;2975|
            //4 - 606.70;-1.03;-0.17;1245996;359.64;31|
            //5 - 80.392705;0.270223;0.337262;50968494;596.8565745;95;175;91;15120;10;8;97;0;0;0;0|
            //6 - 844087;5.1395924|
            //7 - 0;0|
            //8 - 0;0;0|
            //9 - 47.32;0.13;0.27;3026436;20.9699222;18;113;22;786;9;5;98;409422;278472;10280;409422|
            //10 - 10750;0.066|
            //11 - 0;0|
            //12 - 0;0;0|
            //13 - 642.25;-1.75;-0.27;32058160;648.396;7;15;8|
            //14 - 575.32;-1.1;-0.19;49736660;891.604;27;41;27|
            //15 - 578.11;-0.86;-0.15;62235408;1004.297;72;80;72|
            //16 - 595.77;1.09;0.18;17678500;243.208;20;26;19|
            //17 - 611.69;2.42;0.40;12498750;112.693;45;39;45

            result += GetSBSStockData(Symbols);
            /*
            string indexData = ReadFile("indexVN30", "HO");
            if(indexData.Length > 0)
            {
                string[] indexes = indexData.Split('|');
                if(indexes.Length > 0)
                {
                    string[] vnIndexes = indexes[0].Split(';');
                    if(vnIndexes.Length > 0)
                    {
                        result += String.Format("VNINDEX;{0};{1};{2};{3}", vnIndexes[3], float.Parse(vnIndexes[0]).ToString("N2"),float.Parse(vnIndexes[1]).ToString("N2"), float.Parse(vnIndexes[2]).ToString("N2"));
                    }
                    string[] hnxIndexes = indexes[5].Split(';');
                    if (hnxIndexes.Length > 0)
                    {
                        result += String.Format("|HNXINDEX;{0};{1};{2};{3}", hnxIndexes[3], float.Parse(hnxIndexes[0]).ToString("N2"), float.Parse(hnxIndexes[1]).ToString("N2"), float.Parse(hnxIndexes[2]).ToString("N2"));
                    }
                    string[] upcomIndexes = indexes[9].Split(';');
                    if (upcomIndexes.Length > 0)
                    {
                        result += String.Format("|UPCOMINDEX;{0};{1};{2};{3}", upcomIndexes[3], float.Parse(upcomIndexes[0]).ToString("N2"), float.Parse(upcomIndexes[1]).ToString("N2"), float.Parse(upcomIndexes[2]).ToString("N2"));
                    }
                    string[] vn30Indexes = indexes[13].Split(';');
                    if (vn30Indexes.Length > 0)
                    {
                        result += String.Format("|VN30;{0};{1};{2};{3}|", vn30Indexes[3], float.Parse(vn30Indexes[0]).ToString("N2"), float.Parse(vn30Indexes[1]).ToString("N2"), float.Parse(vn30Indexes[2]).ToString("N2"));
                    }
                }

                
            }
            */
            //Lay du lieu cua tung ma
            return result;
        }
        
        private string GetSBSStockData(string Symbols)
        {
            string result = "";

            string Symbol = Symbols;
            
            if (Symbol.Length >= 3)
            {
                int intID;
                DateTime dtmSessionDate, dtmSessionTime;
                string strSymbol;
                float flCeilingPrice, FloorPrice, RefPrice, FinishPrice, Diff, DiffRate, TotalShare;
                DataTable objResult = new DataTable("StockData");
                objResult.Columns.Add("ID");
                objResult.Columns.Add("Symbol");
                objResult.Columns.Add("SessionDate");
                objResult.Columns.Add("SessionTime");
                objResult.Columns.Add("CeilingPrice");
                objResult.Columns.Add("FloorPrice");
                objResult.Columns.Add("RefPrice");
                objResult.Columns.Add("FinishPrice");
                objResult.Columns.Add("Diff");
                objResult.Columns.Add("DiffRate");
                objResult.Columns.Add("TotalShare");
                string[] objSymbol = Symbol.Split(',');

                string strHOData = ReadFile("0", "HO");
                string strHORef = ReadFile("ref", "HO");

                string strSessionDate = strHOData.Split('@')[0];

                int iCount = 0;
                
                //Lay gia tri tung Index
                string[] arrHOIndexes = strHOData.Split('@')[2].Split('|');
                
                if(arrHOIndexes.Length > 0)
                {
                    string strHOIndex = arrHOIndexes[0];
                    string strHAIndex = arrHOIndexes[13];
                    string strUPCIndex = arrHOIndexes[14];
					
					string strVN30Data = arrHOIndexes[6];
					string strVNMIDData = arrHOIndexes[9];
					string strVNALLData = arrHOIndexes[10];
					string strVNSMLData = arrHOIndexes[8];
					string strVN100Data = arrHOIndexes[7];

                    string[] vnIndexes = strHOIndex.Split(';');

                    float index = 0;
                    float diff = 0;
                    float refIndex = 0;
                    
                    if (vnIndexes.Length > 0)
                    {
                        index = float.Parse(vnIndexes[2]);
                        diff = float.Parse(vnIndexes[3]);
                        refIndex = index - diff;
                        result += String.Format("VNINDEX;{0};{1};{2};{3}", vnIndexes[6], index.ToString("N2"), refIndex.ToString("N2"), strSessionDate);
                    }
                    string[] hnxIndexes = strHAIndex.Split(';');
                    if (hnxIndexes.Length > 0)
                    {
                        index = float.Parse(hnxIndexes[2]);
                        diff = float.Parse(hnxIndexes[3]);
                        refIndex = index - diff;
                        result += String.Format("|HNXINDEX;{0};{1};{2};{3}", hnxIndexes[6], index.ToString("N2"), refIndex.ToString("N2"), strSessionDate);
                    }
                    string[] upcomIndexes = strUPCIndex.Split(';');
                    if (upcomIndexes.Length > 0)
                    {
                        index = float.Parse(upcomIndexes[2]);
                        diff = float.Parse(upcomIndexes[3]);
                        refIndex = index - diff;
                        result += String.Format("|UPCOMINDEX;{0};{1};{2};{3}", upcomIndexes[6], index.ToString("N2"), refIndex.ToString("N2"), strSessionDate);
                    }
                    
                    string[] vn30Indexes = strVN30Data.Split(';');
                    if (vn30Indexes.Length > 0)
                    {
                        index = float.Parse(vn30Indexes[2]);
                        diff = float.Parse(vn30Indexes[3]);
                        refIndex = index - diff;
                        result += String.Format("|VN30;{0};{1};{2};{3}", vn30Indexes[6], index.ToString("N2"), refIndex.ToString("N2"), strSessionDate);
                    }

                    string[] vnMidIndexes = strVNMIDData.Split(';');
                    if (vnMidIndexes.Length > 0)
                    {
                        index = float.Parse(vnMidIndexes[2]);
                        diff = float.Parse(vnMidIndexes[3]);
                        refIndex = index - diff;
                        result += String.Format("|VNMID;{0};{1};{2};{3}", vnMidIndexes[6], index.ToString("N2"), refIndex.ToString("N2"), strSessionDate);
                    }

                    string[] vnALLIndexes = strVNALLData.Split(';');
                    if (vnALLIndexes.Length > 0)
                    {
                        index = float.Parse(vnALLIndexes[2]);
                        diff = float.Parse(vnALLIndexes[3]);
                        refIndex = index - diff;
                        result += String.Format("|VNALL;{0};{1};{2};{3}", vnALLIndexes[6], index.ToString("N2"), refIndex.ToString("N2"), strSessionDate);
                    }

                    string[] vnSMLIndexes = strVNSMLData.Split(';');
                    if (vnSMLIndexes.Length > 0)
                    {
                        index = float.Parse(vnSMLIndexes[2]);
                        diff = float.Parse(vnSMLIndexes[3]);
                        refIndex = index - diff;
                        result += String.Format("|VNSML;{0};{1};{2};{3}", vnSMLIndexes[6], index.ToString("N2"), refIndex.ToString("N2"), strSessionDate);
                    }

                    string[] vn100Indexes = strVN100Data.Split(';');
                    if (vn100Indexes.Length > 0)
                    {
                        index = float.Parse(vn100Indexes[2]);
                        diff = float.Parse(vn100Indexes[3]);
                        refIndex = index - diff;
                        result += String.Format("|VN100;{0};{1};{2};{3}", vn100Indexes[6], index.ToString("N2"), refIndex.ToString("N2"), strSessionDate);
                    }

                    result += "|";
                }
                
                
                for (int i = 0; i < objSymbol.Length; i++)
                {
                    if (objSymbol[i].Length > 2)
                    {
                        iCount++;
                        strSymbol = objSymbol[i];
                        //Tách nội dung mã này ra từ file 0.
                        string strRef = "", strMain = "";
                        if (strHORef.IndexOf(strSymbol + ";") >= 0)
                        {
                            strRef = strHORef.Substring(strHORef.IndexOf(strSymbol)).Substring(0, strHORef.IndexOf("|"));
                            strMain = strHOData.Substring(strHOData.IndexOf(strSymbol));
                            strMain = strMain.Substring(0, strMain.IndexOf("|"));
                        }

                        string[] objRefs, objDatas;
                        if (strRef.Length > 3 && strMain.Length > 3)
                        {
                            DataRow objNewRow = objResult.NewRow();
                            objRefs = strRef.Split(';');
                            objDatas = strMain.Split(';');

                            objNewRow["ID"] = iCount;
                            objNewRow["Symbol"] = objRefs[0];
                            objNewRow["SessionDate"] = strHOData.Split('@')[0];
                            objNewRow["SessionTime"] = strHOData.Split('@')[0];
                            objNewRow["CeilingPrice"] = objRefs[1];
                            objNewRow["FloorPrice"] = objRefs[2];
                            objNewRow["RefPrice"] = objRefs[3];
                            objNewRow["FinishPrice"] = objDatas[8];
                            objNewRow["Diff"] = objDatas[7];
                            objNewRow["DiffRate"] = double.Parse(objRefs[3]) > 0
                                                        ? ((double.Parse(objDatas[7]) * 100 / double.Parse(objRefs[3]))).
                                                              ToString()
                                                        : "";
                            objNewRow["TotalShare"] = objDatas[10];

                            objResult.Rows.Add(objNewRow);
                        }
                        else
                            break;
                    }
                }
                
                for (int i = 0; i < objResult.Rows.Count;i++)
                {
                    string symbol = objResult.Rows[i]["Symbol"].ToString();
                    string date = objResult.Rows[i]["SessionDate"].ToString();
                    float refPrice = float.Parse(objResult.Rows[i]["RefPrice"].ToString());
                    
                    float vol = float.Parse(objResult.Rows[i]["TotalShare"].ToString());
                    float price = float.Parse(objResult.Rows[i]["FinishPrice"].ToString());
                    float diff = float.Parse(objResult.Rows[i]["Diff"].ToString());
                    float diffRate = float.Parse(objResult.Rows[i]["DiffRate"].ToString());

                    result += String.Format("{0};{1};{2};{3};{4}", symbol, vol, price, refPrice.ToString("N2"), date);
                    
                    if(i<objResult.Rows.Count - 1)
                    {
                        result += "|";
                    }    
                }

                return result;
            }
            else
                return "";
        }

        public string GetStockData(string Symbol, string ExchangeCode)
    {
        /* 
            ID	int,
		    Symbol	nvarchar(50),
		    SessionDate	datetime,
		    SessionTime	datetime,
		    CeilingPrice	float,
		    FloorPrice	float,
		    RefPrice	float,
		    FinishPrice	float,
		    Diff	float,
		    DiffRate	float,
		    TotalShare	float
         * */
        if (Symbol.Length >= 3)
        {
            int intID;
            DateTime dtmSessionDate, dtmSessionTime;
            string strSymbol;
            float flCeilingPrice, FloorPrice, RefPrice, FinishPrice, Diff, DiffRate, TotalShare;
            DataTable objResult = new DataTable("StockData");
            objResult.Columns.Add("ID");
            objResult.Columns.Add("Symbol");
            objResult.Columns.Add("SessionDate");
            objResult.Columns.Add("SessionTime");
            objResult.Columns.Add("CeilingPrice");
            objResult.Columns.Add("FloorPrice");
            objResult.Columns.Add("RefPrice");
            objResult.Columns.Add("FinishPrice");
            objResult.Columns.Add("Diff");
            objResult.Columns.Add("DiffRate");
            objResult.Columns.Add("TotalShare");
            string[] objSymbol = Symbol.Split(',');

            string strHOData = ReadFile("0", "HO");
            string strHAData = ReadFile("0", "HA");
            string strUpcomData = ReadFile("0", "UPCOM");

            string strHORef = ReadFile("ref", "HO");
            string strHARef = ReadFile("ref", "HA");
            string strUPCOMRef = ReadFile("ref", "UPCOM");

            int iCount = 0;
            for (int i = 0; i < objSymbol.Length; i++)
            {
                if (objSymbol[i].Length > 2)
                {
                    iCount++;
                    strSymbol = objSymbol[i];
                    //Tách nội dung mã này ra từ file 0.
                    string strRef = "", strMain = "";
                    if (strHORef.IndexOf(strSymbol+";") >= 0)
                    {
                        strRef = strHORef.Substring(strHORef.IndexOf("|"+strSymbol)+1);
                        strRef = strRef.Substring(0, strRef.IndexOf("|"));
                        if(strHOData.IndexOf("|" + strSymbol)>0)
                            strMain = strHOData.Substring(strHOData.IndexOf("|" + strSymbol) + 1);
                        else
                            strMain = strHOData.Substring(strHOData.IndexOf("@" + strSymbol) + 1);
                        strMain = strMain.Substring(0, strMain.IndexOf("|"));
                        //blnHO = true;
                    }
                    else if (strHARef.IndexOf(strSymbol+";") >= 0)
                    {
                        strRef = strHARef.Substring(strHARef.IndexOf("|" + strSymbol) + 1);
                        strRef= strRef.Substring(0, strRef.IndexOf("|"));
                        if(strHAData.IndexOf("|" + strSymbol)>0)
                            strMain = strHAData.Substring(strHAData.IndexOf("|" + strSymbol) + 1);
                        else
                            strMain = strHAData.Substring(strHAData.IndexOf("@" + strSymbol) + 1);
                        strMain = strMain.Substring(0, strMain.IndexOf("|"));
                        //blnHA = true;
                    }
                    else if (strUPCOMRef.IndexOf(strSymbol+";") >= 0)
                    {
                        strRef = strUPCOMRef.Substring(strUPCOMRef.IndexOf("|" + strSymbol) + 1);
                        strRef = strRef.Substring(0, strRef.IndexOf("|"));
                        if(strUpcomData.IndexOf("|" + strSymbol)>0)
                            strMain = strUpcomData.Substring(strUpcomData.IndexOf("|" + strSymbol) + 1);
                        else
                            strMain = strUpcomData.Substring(strUpcomData.IndexOf("@" + strSymbol) + 1);
                        strMain = strMain.Substring(0, strMain.IndexOf("|"));
                        //blnUPCOM = true;
                    }

                    string[] objRefs, objDatas;
                    if (strRef.Length > 3 && strMain.Length > 3)
                    {
                        DataRow objNewRow = objResult.NewRow();
                        objRefs = strRef.Split(';');
                        objDatas = strMain.Split(';');

                        objNewRow["ID"] = iCount;
                        objNewRow["Symbol"] = objRefs[0].ToString();
                        objNewRow["SessionDate"] = strHOData.Split('@')[0];
                        objNewRow["SessionTime"] = strHOData.Split('@')[0];
                        objNewRow["CeilingPrice"] = objRefs[1].ToString();
                        objNewRow["FloorPrice"] = objRefs[2].ToString();
                        objNewRow["RefPrice"] = objRefs[3].ToString();
                        objNewRow["FinishPrice"] = objDatas[8].ToString();
                        objNewRow["Diff"] = objDatas[7].ToString();
                        objNewRow["DiffRate"] = double.Parse(objRefs[3].ToString()) > 0 ? ((double.Parse(objDatas[7].ToString()) * 100 / double.Parse(objRefs[3].ToString()))).ToString() : "";
                        objNewRow["TotalShare"] = objDatas[10].ToString();

                        objResult.Rows.Add(objNewRow);
                    }
                    else
                        break;
                }
            }

            return GetResultDataJSON(objResult, "StockData");
            //System.Data.DataTable objResult = SqlHelper.ExecuteDataset(m_strConnectionString, "dbo.dnn_AGStock_GetStockData", Symbol, ExchangeCode).Tables[0];
            //if (objResult != null && objResult.Rows.Count > 0)
            //{
            //    return GetResultDataJSON(objResult, "StockData");
            //}
            //else
            //{
            //    return "";
            //}
        }
        else
            return "";
    }

        public string GetMobileStockData(string Symbol)
        {
            /* 
                ID	int,
                Symbol	nvarchar(50),
                SessionDate	datetime,
                SessionTime	datetime,
                CeilingPrice	float,
                FloorPrice	float,
                RefPrice	float,
                FinishPrice	float,
                Diff	float,
                DiffRate	float,
                TotalShare	float
             * */
            if (Symbol.Length >= 3)
            {
                string strSymbol;
                var objResult = new DataTable("StockData");
                objResult.Columns.Add("ID");
                objResult.Columns.Add("Symbol");
                objResult.Columns.Add("SessionDate");
                objResult.Columns.Add("SessionTime");
                objResult.Columns.Add("CeilingPrice");
                objResult.Columns.Add("FloorPrice");
                objResult.Columns.Add("RefPrice");
                objResult.Columns.Add("FinishPrice");
                objResult.Columns.Add("Diff");
                objResult.Columns.Add("DiffRate");
                objResult.Columns.Add("TotalShare");
                objResult.Columns.Add("Highest");
                objResult.Columns.Add("Lowest");
                objResult.Columns.Add("Bid");
                objResult.Columns.Add("Offer");
                objResult.Columns.Add("FgBuy");
                objResult.Columns.Add("FgSell");

                objResult.Columns.Add("BuyPrice1");
                objResult.Columns.Add("BuyAmount1");
                objResult.Columns.Add("FinishAmount");
                objResult.Columns.Add("SellPrice1");
                objResult.Columns.Add("SellPrice2");

                string[] objSymbol = Symbol.Split(',');

                string strHOData = ReadFile("0", "HO");
                string strHAData = ReadFile("0", "HA");
                string strUpcomData = ReadFile("0", "UPCOM");

                string strHORef = ReadFile("ref", "HO");
                string strHARef = ReadFile("ref", "HA");
                string strUPCOMRef = ReadFile("ref", "UPCOM");

                int iCount = 0;
                for (int i = 0; i < objSymbol.Length; i++)
                {
                    if (objSymbol[i].Length > 2)
                    {
                        iCount++;
                        strSymbol = objSymbol[i];
                        //Tách nội dung mã này ra từ file 0.
                        string strRef = "", strMain = "";
                        bool blnHO = false, blnHA = false, blnUPCOM = false;
                        if (strHORef.IndexOf(strSymbol) >= 0)
                        {
                            strRef = strHORef.Substring(strHORef.IndexOf("|" + strSymbol) + 1);
                            strRef = strRef.Substring(0, strRef.IndexOf("|"));
                            if (strHOData.IndexOf("|" + strSymbol) > 0)
                                strMain = strHOData.Substring(strHOData.IndexOf("|" + strSymbol) + 1);
                            else
                                strMain = strHOData.Substring(strHOData.IndexOf("@" + strSymbol) + 1);
                            strMain = strMain.Substring(0, strMain.IndexOf("|"));
                            blnHO = true;
                        }
                        else if (strHARef.IndexOf(strSymbol) >= 0)
                        {
                            strRef = strHARef.Substring(strHARef.IndexOf("|" + strSymbol) + 1);
                            strRef = strRef.Substring(0, strRef.IndexOf("|"));
                            if (strHAData.IndexOf("|" + strSymbol) > 0)
                                strMain = strHAData.Substring(strHAData.IndexOf("|" + strSymbol) + 1);
                            else
                                strMain = strHAData.Substring(strHAData.IndexOf("@" + strSymbol) + 1);
                            strMain = strMain.Substring(0, strMain.IndexOf("|"));
                            blnHA = true;
                        }
                        else if (strUPCOMRef.IndexOf(strSymbol) >= 0)
                        {
                            strRef = strUPCOMRef.Substring(strUPCOMRef.IndexOf("|" + strSymbol) + 1);
                            strRef = strRef.Substring(0, strRef.IndexOf("|"));
                            if (strUpcomData.IndexOf("|" + strSymbol) > 0)
                                strMain = strUpcomData.Substring(strUpcomData.IndexOf("|" + strSymbol) + 1);
                            else
                                strMain = strUpcomData.Substring(strUpcomData.IndexOf("@" + strSymbol) + 1);
                            strMain = strMain.Substring(0, strMain.IndexOf("|"));
                            blnUPCOM = true;
                        }

                        string[] objRefs, objDatas;
                        if (strRef.Length > 3 && strMain.Length > 3)
                        {
                            DataRow objNewRow = objResult.NewRow();
                            objRefs = strRef.Split(';');
                            objDatas = strMain.Split(';');

                            //KLS;33.4;800;33.5;4700;33.6;1490;0.7;33.6;10;389180;
                            //33.7;2940;33.8;4890;33.9;7620;33.3;33.9;32.0;37660;
                            //21000;0;0;0;0;4628805;0;561670;513640;1707;1880;172490;124460;0.721549075308714;1.38590711875301

                            //ABT;58.0;2018;58.5;1900;59.0;6900;2.5;59.5;19529;35546;
                            //59.5;1933;0;0;0;0;57.0;59.5;57.0;4201;
                            //0;0;0;0;0;320787;555642;57.0;1241;58.5;14738
                            objNewRow["ID"] = iCount;
                            objNewRow["Symbol"] = objRefs[0];
                            objNewRow["SessionDate"] = strHOData.Split('@')[0];
                            objNewRow["SessionTime"] = strHOData.Split('@')[0];
                            objNewRow["CeilingPrice"] = objRefs[1];
                            objNewRow["FloorPrice"] = objRefs[2];
                            objNewRow["RefPrice"] = objRefs[3];
                            objNewRow["FinishPrice"] = objDatas[8];
                            objNewRow["Diff"] = objDatas[7];
                            objNewRow["DiffRate"] = double.Parse(objRefs[3]) > 0
                                                        ? ((double.Parse(objDatas[7]) * 100 / double.Parse(objRefs[3]))).
                                                              ToString("N2")
                                                        : "";
                            objNewRow["TotalShare"] = objDatas[10];

                            objNewRow["Highest"] = objDatas[18];
                            objNewRow["Lowest"] = objDatas[19];
                            if (blnHA || blnUPCOM)
                            {
                                objNewRow["Bid"] = objDatas.Length > 24 ? objDatas[28] : "0";
                                objNewRow["Offer"] = objDatas.Length > 24 ? objDatas[29] : "0";
                                objNewRow["FgSell"] = objDatas.Length > 24 ? objDatas[21] : "0";
                            }
                            else
                            {
                                //Neu la san HO thi phai lay tu DB ra
                                DataTable objHONew =
                                    SqlHelper.ExecuteDataset(m_strConnectionString, "dnn_AGStock_GetHOSESync", strSymbol).
                                        Tables[0];
                                if (objHONew.Rows.Count > 0)
                                {
                                    objNewRow["Bid"] = objHONew.Rows[0]["TotalBid"].ToString();
                                    objNewRow["Offer"] = objHONew.Rows[0]["TotalOffer"].ToString();
                                    objNewRow["FgSell"] = objHONew.Rows[0]["FGSell"].ToString();
                                }
                                else
                                {
                                    objNewRow["Bid"] = 0;
                                    objNewRow["Offer"] = 0;
                                    objNewRow["FgSell"] = 0;
                                }
                            }
                            objNewRow["FgBuy"] = objDatas[20];

                            objNewRow["BuyPrice1"] = objDatas[5];
                            objNewRow["BuyAmount1"] = objDatas[6];
                            objNewRow["FinishAmount"] = objDatas[9];
                            objNewRow["SellPrice1"] = objDatas[11];
                            objNewRow["SellPrice2"] = objDatas[13];
                            objResult.Rows.Add(objNewRow);
                        }
                        else
                            break;
                    }
                }

                return GetResultData(objResult);
                //System.Data.DataTable objResult = SqlHelper.ExecuteDataset(m_strConnectionString, "dbo.dnn_AGStock_GetStockData", Symbol, ExchangeCode).Tables[0];
                //if (objResult != null && objResult.Rows.Count > 0)
                //{
                //    return GetResultDataJSON(objResult, "StockData");
                //}
                //else
                //{
                //    return "";
                //}
            }
            else
                return "";
        }

        public string GetIndexData()
        {
            //Lay ra 3 du lieu tu 3 file 0, sau do merge lai voi nhau.
            if (HttpContext.Current.Cache["index"] != null)
            {
                return HttpContext.Current.Cache["index"].ToString();
            }
            else
            {
                string strHO = ReadFile("0", "HO");
                string strHA = ReadFile("0", "HA");
                string strUPCOM = ReadFile("0", "UPCOM");

                string strHOIndex = "", strHAIndex = "", strUPCOMIndex = "";
                string[] objHO = strHO.Split('@');
                if (objHO.Length > 4)
                    strHOIndex = objHO[2];
                else
                    strHOIndex = ";;;;;;;|;;;;|;;;;|;;;;|;;;;";
                string[] objHA = strHA.Split('@');
                if (objHA.Length > 4)
                    strHAIndex = objHA[2];
                else
                    strHAIndex = ";;;;;;;|;|;|;";
                string[] objUPCOM = strUPCOM.Split('@');
                if (objUPCOM.Length > 4)
                    strUPCOMIndex = objUPCOM[2];
                else
                    strUPCOMIndex = ";;;;;;;|;|;|;";

                string strResult = String.Format("{0}|{1}|{2}", objHO[2], objHA[2], objUPCOM[2]);
                HttpContext.Current.Cache["index"] = strResult;
                return strResult;
            }

            //System.Data.DataSet objResult = SqlHelper.ExecuteDataset(m_strConnectionString, "dbo.dnn_AGStock_GetIndexData");
            //System.Data.DataTable objHO = new DataTable(), objHA = new DataTable(), objUpcom = new DataTable();
            //if (objResult.Tables.Count > 2)
            //    objUpcom = objResult.Tables[2];
            //if (objResult.Tables.Count > 1)
            //    objHA = objResult.Tables[1];
            //if (objResult.Tables.Count > 0)
            //    objHO = objResult.Tables[0];

            ////Sinh ra dữ liệu tại đây
            //string strHO = ";;;;;;;|;;;;|;;;;|;;;;|;;;;", strHA = ";;;;;;;|;|;|;", strUPCOM = ";;;;;;;|;|;|;";
            //if (objHO != null && objHO.Rows.Count > 0)
            //{
            //    strHO = "";
            //    DataTable objMarketTable = objHO;
            //    double dblIndex1, dblIndex2, dblIndex3, dblIndex, dblLastVNIndex;
            //    double dblDiff1, dblDiffRate1, dblDiff2, dblDiffRate2, dblDiff3, dblDiffRate3, dblDiff, dblDiffRate;
            //    double dblTotalTrade1, dblTotalShare1, dblTotalValues1, dblTotalTrade2, dblTotalShare2, dblTotalValues2, dblTotalTrade3, dblTotalShare3, dblTotalValues3, dblTotalTrade, dblTotalShare, dblTotalValues, dblPTTotalValues, dblPTTotalShare, dblPTTotalTrade;
            //    int intAdvanced = 0, intDeclines = 0, intNoChange = 0;

            //    intAdvanced = int.Parse(objMarketTable.Rows[0]["Advances"].ToString());
            //    intDeclines = int.Parse(objMarketTable.Rows[0]["Declines"].ToString());
            //    intNoChange = int.Parse(objMarketTable.Rows[0]["NoChange"].ToString());

            //    dblIndex1 = double.Parse(objMarketTable.Rows[0]["Index1"].ToString());
            //    dblDiff1 = double.Parse(objMarketTable.Rows[0]["Diff1"].ToString());
            //    dblDiffRate1 = double.Parse(objMarketTable.Rows[0]["DiffRate1"].ToString());
            //    dblTotalValues1 = double.Parse(objMarketTable.Rows[0]["Total1"].ToString());
            //    dblTotalShare1 = double.Parse(objMarketTable.Rows[0]["TotalShare1"].ToString());
            //    dblTotalTrade1 = double.Parse(objMarketTable.Rows[0]["TotalTrade1"].ToString());

            //    dblIndex2 = double.Parse(objMarketTable.Rows[0]["Index2"].ToString());
            //    dblDiff2 = double.Parse(objMarketTable.Rows[0]["Diff2"].ToString());
            //    dblDiffRate2 = double.Parse(objMarketTable.Rows[0]["DiffRate2"].ToString());
            //    dblTotalValues2 = double.Parse(objMarketTable.Rows[0]["Total2"].ToString());
            //    dblTotalShare2 = double.Parse(objMarketTable.Rows[0]["TotalShare2"].ToString());
            //    dblTotalTrade2 = double.Parse(objMarketTable.Rows[0]["TotalTrade2"].ToString());

            //    dblIndex3 = double.Parse(objMarketTable.Rows[0]["Index3"].ToString());
            //    dblDiff3 = double.Parse(objMarketTable.Rows[0]["Diff3"].ToString());
            //    dblDiffRate3 = double.Parse(objMarketTable.Rows[0]["DiffRate3"].ToString());
            //    dblTotalValues3 = double.Parse(objMarketTable.Rows[0]["Total3"].ToString());
            //    dblTotalShare3 = double.Parse(objMarketTable.Rows[0]["TotalShare3"].ToString());
            //    dblTotalTrade3 = double.Parse(objMarketTable.Rows[0]["TotalTrade3"].ToString());

            //    dblPTTotalShare = double.Parse(objMarketTable.Rows[0]["PTTotalShare"].ToString());
            //    dblPTTotalValues = double.Parse(objMarketTable.Rows[0]["PTTotal"].ToString());
            //    dblPTTotalTrade = double.Parse(objMarketTable.Rows[0]["PTTotalTrade"].ToString());

            //    dblIndex = double.Parse(objMarketTable.Rows[0]["Index"].ToString());
            //    dblDiff = double.Parse(objMarketTable.Rows[0]["Diff"].ToString());
            //    dblDiffRate = double.Parse(objMarketTable.Rows[0]["DiffRate"].ToString());
            //    dblTotalValues = double.Parse(objMarketTable.Rows[0]["Total"].ToString());
            //    dblTotalShare = double.Parse(objMarketTable.Rows[0]["TotalShare"].ToString());
            //    dblTotalTrade = double.Parse(objMarketTable.Rows[0]["TotalTrade"].ToString());

            //    //strMarketResult = String.Format("{18};{19};{20};{21};{22};{23};{24};{25};{26}|{0};{1};{2};{3};{4};{5}|{6};{7};{8};{9};{10};{11}|{12};{13};{14};{15};{16};{17}",
            //    strHO = String.Format("{15};{16};{17};{18};{19};{20};{21};{22}|{0};{1};{2};{3};{4}|{5};{6};{7};{8};{9}|{10};{11};{12};{13};{14}|{10};{11};{12};{23};{24}",
            //        dblIndex1.ToString("N2").Replace(",", ""), dblDiff1.ToString("N2").Replace(",", ""), dblDiffRate1.ToString("N2").Replace(",", ""), dblTotalShare1.ToString("N0").Replace(",", ""), dblTotalValues1.ToString("N3").Replace(",", "")/*, dblTotalTrade1.ToString("N0")*/,
            //        dblIndex2.ToString("N2").Replace(",", ""), dblDiff2.ToString("N2").Replace(",", ""), dblDiffRate2.ToString("N2").Replace(",", ""), dblTotalShare2.ToString("N0").Replace(",", ""), dblTotalValues2.ToString("N3").Replace(",", "")/*, dblTotalTrade2.ToString("N0")*/,
            //        dblIndex3.ToString("N2").Replace(",", ""), dblDiff3.ToString("N2").Replace(",", ""), dblDiffRate3.ToString("N2").Replace(",", ""), dblTotalShare3.ToString("N0").Replace(",", ""), dblTotalValues3.ToString("N3").Replace(",", "")/*, dblTotalTrade3.ToString("N0")*/,
            //        dblIndex.ToString("N2").Replace(",", ""), dblDiff.ToString("N2").Replace(",", ""), dblDiffRate.ToString("N2").Replace(",", ""), dblTotalShare.ToString("N0").Replace(",", ""), dblTotalValues.ToString("N3").Replace(",", "")/*, dblTotalTrade.ToString("N0").Replace(",", "")*/,
            //        intAdvanced.ToString(), intNoChange.ToString(), intDeclines.ToString(), dblPTTotalShare, dblPTTotalValues
            //        );
            //}

            //if (objHA != null && objHA.Rows.Count > 0)
            //{
            //    strHA = "";
            //    DataRow objNew = objHA.Rows[0];

            //    strHA += String.Format("{0};{1};{2};{3};{4};{5};{6};{7}|",
            //            objNew["Index3"].ToString(), objNew["Diff3"].ToString(), objNew["DiffRate3"].ToString(),
            //            objNew["TotalShare3"].ToString(), objNew["Total3"].ToString(),
            //            objNew["Advances"].ToString(), objNew["NoChange"].ToString(), objNew["Declines"].ToString());

            //    strHA += String.Format("{0};{1}|",
            //        objNew["TotalShare1"].ToString(), objNew["Total1"].ToString());

            //    strHA += String.Format("{0};{1}|",
            //        objNew["TotalShare2"].ToString(), objNew["Total2"].ToString());

            //    strHA += String.Format("{0};{1}",
            //        objNew["PTTotalShare"].ToString(), objNew["PTTotal"].ToString());
            //}

            //if (objUpcom != null && objUpcom.Rows.Count > 0)
            //{
            //    strUPCOM = "";
            //    DataRow objNew = objUpcom.Rows[0];

            //    strUPCOM += String.Format("{0};{1};{2};{3};{4};{5};{6};{7}|",
            //            objNew["Index3"].ToString(), objNew["Diff3"].ToString(), objNew["DiffRate3"].ToString(),
            //            objNew["TotalShare3"].ToString(), objNew["Total3"].ToString(),
            //            objNew["Advances"].ToString(), objNew["NoChange"].ToString(), objNew["Declines"].ToString());

            //    strUPCOM += String.Format("{0};{1}|",
            //        objNew["TotalShare1"].ToString(), objNew["Total1"].ToString());

            //    strUPCOM += String.Format("{0};{1}|",
            //        objNew["TotalShare2"].ToString(), objNew["Total2"].ToString());

            //    strUPCOM += String.Format("{0};{1}",
            //        objNew["PTTotalShare"].ToString(), objNew["PTTotal"].ToString());
            //}

            //return String.Format("{0}|{1}|{2}", strHO, strHA, strUPCOM);
        }

        public string GetResultDataJSON(DataTable TableName, string ItemName)
        {
            var oBuilder = new StringBuilder();
            oBuilder.Append("{\"" + ItemName + "\": ");
            oBuilder.Append("[");
            for (int i = 0; i < TableName.Rows.Count; i++)
            {
                oBuilder.Append("{");
                for (int j = 0; j < TableName.Columns.Count; j++)
                {
                    oBuilder.AppendFormat("'{0}' : '{1}',", TableName.Columns[j].Caption, TableName.Rows[i][j]);
                }
                oBuilder.Remove(oBuilder.Length - 1, 1);
                oBuilder.Append("},");
            }
            oBuilder.Remove(oBuilder.Length - 1, 1);
            oBuilder.Append("]}");
            return oBuilder.ToString();
        }

        public string GetResultData(DataTable TableName)
        {
            string strResult = "";
            for (int i = 0; i < TableName.Rows.Count; i++)
            {
                strResult += TableName.Rows[i][0].ToString();
                for (int j = 1; j < TableName.Columns.Count; j++)
                {
                    strResult = String.Format("{0},{1}", strResult, TableName.Rows[i][j]);
                }

                if (i != TableName.Rows.Count - 1)
                {
                    strResult += "|";
                }
            }

            return strResult;
        }

        public string GetRef()
        {
            string strRef = "";
            strRef = ReadFile("ref", "HA");
            return strRef;
        }

        public string AnalyzeData()
        {
            string strResult = "";

            strResult = ReadFile("0", "HA");

            string strRef = "";
            strRef = ReadFile("ref", "HA");

            //Bat dau phan tich du lieu o day
            //ACB;46.2;9690;46.3;11060;46.4;110;-0.8;46.4;40;116940;46.5;1570;46.6;3070;46.7;3000;46.6;47.0;46.3;0;0;0;0;0;0;0;0;274140;168760;1303;742;157200;51820;0.329643765903308;3.03357776920108
            //GM1;KLM1;GM2;KLM2;GM3;KLM3;Thay đổi;Giá khớp;KL khớp;Tổng KL khớp;GB1;KLB1;GB2;KLB2;GB3;KLB3;TB;Cao;Thấp;0;0;0;0;0;0;Room nước ngoài còn;0;Tổng KL Mua;Tổng KL Bán;Số lệnh mua;Số lệnh bán;
            string[] mainData = new string[] { },
                     securityData = new string[] { },
                     priceData = new string[] { },
                     refData = new string[] { };
            mainData = strResult.Split('@');
            if (mainData.Length > 3)
            {
                securityData = mainData[3].Split('|'); //Tach ra duoc cac dong
                refData = strRef.Split('|');
            }

            int iLength = securityData.Length;
            var ascData = new string[iLength];
            var descData = new string[iLength];
            var bSData = new double[iLength];
            var SbData = new double[iLength];
            var name1Data = new string[iLength];
            var name2Data = new string[iLength];

            for (int i = 0; i < securityData.Length; i++)
            {
                string[] prices = securityData[i].Split(';');
                string[] refs = refData[i].Split(';');
                name1Data[i] = securityData[i] + ";" + refData[i];
                name2Data[i] = securityData[i] + ";" + refData[i];
                bSData[i] = double.Parse(prices[35]);
                SbData[i] = double.Parse(prices[33]);
            }

            Array.Sort(bSData, name1Data);
            Array.Sort(SbData, name2Data);

            //Lay ra 15 ban ghi cua 2 mang tren, ghep vao bang gia
            mainData[3] = "";
            int iCount = 0;
            for (int i = bSData.Length - 1; i >= 0; i--)
            {
                if (iCount <= 25)
                {
                    string[] temp = name1Data[i].Split(';');
                    if (double.Parse(temp[32]) * 10 > 50000 && temp[33] != "0")
                    {
                        mainData[3] += name1Data[i] + "|";
                        iCount++;
                    }
                }
                else
                {
                    mainData[3] += "*";
                    break;
                }
            }

            iCount = 0;
            for (int i = SbData.Length - 1; i >= 0; i--)
            {
                if (iCount <= 25)
                {
                    string[] temp = name1Data[i].Split(';');
                    //if (double.Parse(temp[33]) * 10 > 30000 && temp[32] != "0")
                    //{
                    mainData[3] += name2Data[i] + "|";
                    iCount++;
                    //}
                }
                else
                {
                    mainData[3] += "*";
                    break;
                }
            }

            return mainData[3];
        }

        private string ReadFile(string fileName, string floor)
        {
            string strResult = "";
            try
            {
                //if (HttpContext.Current.Cache[String.Format("{0}_{1}", floor, fileName)] != null)
                //{
                //    strResult = HttpContext.Current.Cache[String.Format("{0}_{1}", floor, fileName)].ToString();
                //}
                //else
                //{
                //object obj = new object();
                //if (floor == "HO")
                //    obj = SqlHelper.ExecuteScalar(m_strConnectionString, "dnn_AGStock_HOSTC_GetDataVersion", fileName);
                //else if (floor == "HA")
                //    obj = SqlHelper.ExecuteScalar(m_strConnectionString, "dnn_AGStock_HASTC_GetDataVersion", fileName);
                //else if (floor == "UPCOM")
                //    obj = SqlHelper.ExecuteScalar(m_strConnectionString, "dnn_AGStock_UPCOM_GetDataVersion", fileName);

                //strResult = obj.ToString();
                //HttpContext.Current.Cache[String.Format("{0}_{1}", floor, fileName)] = strResult;
                string strUrl = "";
                //if (floor == "HO")
                    strUrl = String.Format("http://localhost/HO.ashx?FileName={0}", fileName);
                /*else if (floor == "HA")
                    strUrl = String.Format("http://localhost/HA.ashx?FileName={0}", fileName);
                else if (floor == "UPCOM")
                    strUrl = String.Format("http://localhost/UPCOM.ashx?FileName={0}", fileName);
                */
				strResult = GetContent(strUrl);
                //}
            }
            catch
            {
                strResult = "";
            }
            return strResult;
        }

        private string GetContent(string url)
        {
            string m_strUserAgent = "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)";
            WebClient objWC = new WebClient();
            objWC.Headers.Add("user-agent", m_strUserAgent);

            try
            {
                Stream MyStream = objWC.OpenRead(url);
                StreamReader MyReader = new StreamReader(MyStream);
                return WebRegEx.HtmlcodeToUnicode(MyReader.ReadToEnd());
            }
            catch
            {
                return " Error";
            }
        }
    }
}