<%@ WebHandler Language="C#" Class="HO" %>

using System;
using System.Configuration;
using System.IO;
using System.Net;
using System.Web;
using WebSpiderLib;
using Microsoft.ApplicationBlocks.Data;

using BeIT.MemCached;
using StockBoard.Definitions;
using System.Configuration;

public class HO : IHttpHandler
{
    //private static MemcachedClient _memcachedClient;

    public HO()
    {
        //_memcachedClient = MemcachedClient.GetInstance("StockBoardCache");
    }

    private static void SetupCache()
    {
        //if (_memcachedClient == null)
        //    _memcachedClient = MemcachedClient.GetInstance("StockBoardCache");
    }

    //public string GetData(string key)
    //{
    //    SetupCache();
    //    string result = _memcachedClient.Get(key) as string;

    //    return result;
    //}

    public bool IsReusable
    {
        get { return false; }
    }

    public void ProcessRequest(HttpContext context)
    {
        context.Response.Cache.SetCacheability(HttpCacheability.NoCache);
        context.Response.ContentType = "text/plain";
        string strResult = "";
        if (context.Request["FileName"] != null)
        {
            string fileName = context.Request["FileName"].ToString();
            /*
            if (fileName != "0" && fileName != "ref" && fileName != "market" && fileName != "ho_pt" && fileName != "hnx_pt" && fileName != "indexes" && fileName != "sb_last" && fileName != "ff")
            {
                //Neu la cac dataversion thi tu dong ghep vao
                int dataversionID = -1;
                bool check = int.TryParse(fileName, out dataversionID);
                if(check)
                {
                    //Neu la dataversion dang so thi kiem tra sb_last, lay ra toan bo dataversion tu hien tai -> last
                    int sb_last = -1;
                    bool lastCheck = int.TryParse(GetRawData("sb_last"), out sb_last);
                    if (lastCheck)
                    {
                        //Tu dong ghep lai cac dataversion (lay 100 ban ghi 1)
                        if (sb_last - dataversionID > 10)
                            sb_last = dataversionID + 10;

                        string time = "";
                        string marketCode = "";
                        string session = "";
                        string companies = "";
                        string nextVersion = "";
                        
                        for (int i = dataversionID; i < sb_last; i++)
                        {
                            //Phan tich tung dataversion
                            string dataValue = GetRawData(i.ToString());
                            if(dataValue != "")
                            {
                                string[] data = dataValue.Split('@');
                                if(data.Length > 2)
                                {
                                    time = data[0];
                                    marketCode = data[1];
                                    session += String.Format("{0}|{1}", session, data[2]);
                                    companies += String.Format("{0}|{1}", companies, data[3]);
                                    nextVersion = data[4];
                                }
                            }
                        }

                        if(time != "" && marketCode != "" && session != "" && companies != "" && nextVersion != "")
                        {
                            strResult = String.Format("{0}@{1}@{2}@{3}@{4}", time, marketCode, session, companies, nextVersion);    
                        }                        
                    }
                }
            }
            else
            {
                //strResult = GetContent(String.Format("http://banggia.vfpress.vn/HO.ashx?FileName={0}", fileName));
                strResult = GetRawData(context.Request["FileName"]);
            }
             * */
            strResult = GetRawData(fileName);
        }
        context.Response.Write(strResult);
    }

    private string GetRawData(string name)
    {
        string strResult = "";
        strResult = GetContent(String.Format("http://stockboard.sbsc.com.vn/HO.ashx?FileName={0}", name));
        //strResult = GetData(name);

        return strResult;
    }

    private static string GetContent(string url)
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
            return "";
        }
    }
}