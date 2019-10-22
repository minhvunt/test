<%@ WebHandler Language="C#" Class="ChartHandler" %>

using System;
using System.Drawing.Imaging;
using System.Web;
using System.Drawing;
using System.Data;
using System.IO;
using ChartDirector;
using System.Collections;
using System.Collections.Generic;
using System.Xml;
using System.Xml.Serialization;
using Microsoft.ApplicationBlocks.Data;
using WebSpiderLib;

public class ChartHandler : IHttpHandler {

    private string _symbol = "";
    private string _filePath = System.Configuration.ConfigurationSettings.AppSettings["FilePath"];
    private string _chartPath = System.Configuration.ConfigurationSettings.AppSettings["ChartPath"];
    private int _width = int.Parse(System.Configuration.ConfigurationSettings.AppSettings["Width"]);
    private int _height = int.Parse(System.Configuration.ConfigurationSettings.AppSettings["Height"]);
    private int _separator = 20;
    private string _cnn_str = System.Configuration.ConfigurationSettings.AppSettings["CNN_STR"];
    private int _type = 0;
    private string _range = "";
    private int _pageNo = 1;
    private int _pageSize = 20;
    private int _newsId = -1;
    private string _topPriceType = "bid";

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "image/png";
        string callback = context.Request["callback"];
        if (callback == null)
            callback = "callback";

        if (context.Request["Symbol"] != null)
        {
            _symbol = context.Request["Symbol"];
        }

        if (context.Request["TType"] != null)
        {
            _topPriceType = context.Request["TType"];
        }

        if (context.Request["Range"] != null)
        {
            _range = context.Request["Range"];
        }

        if (context.Request["Type"] != null)
        {
            Int32.TryParse(context.Request["Type"].ToString(), out _type);
        }

        if (context.Request["page"] != null)
        {
            Int32.TryParse(context.Request["page"].ToString(), out _pageNo);
        }

        if (context.Request["newsid"] != null)
        {
            Int32.TryParse(context.Request["newsid"].ToString(), out _newsId);
        }

        if (context.Request["rows"] != null)
        {
            Int32.TryParse(context.Request["rows"].ToString(), out _pageSize);
        }

        if (context.Request["Width"] != null)
        {
            Int32.TryParse(context.Request["Width"].ToString(), out _width);
            if (_width > 500)
                _width = 500;
        }

        if (context.Request["Height"] != null)
        {
            Int32.TryParse(context.Request["Height"].ToString(), out _height);
            if (_height > 500)
                _height = 500;
        }

        if(_type == 0)
        {
            //Neu la 0 thi xuat 1 anh
            byte[] image = CreateChart("", false);
            context.Response.OutputStream.Write(image, 0, image.Length);
        }
        else if (_type == 4)
        {
            _width = 300;
            _height = 150;
            string fileName = "_1week";
            byte[] image = DrawFinancialChart(_symbol, fileName, true);
            context.Response.OutputStream.Write(image, 0, image.Length);
        }
        else if (_type == 6)
        {
            context.Response.ContentType = "text/plain";
            string fileName = "";
            DataTable dt = CreateDetailsData(_symbol);

            context.Response.Write(callback + "(" + SerializeDetailData(dt, _pageNo, _pageSize) + ");");
            //context.Response.Write(SerializeDetailData(dt, _pageNo, _pageSize));
        }
        else if (_type == 7)
        {
            context.Response.ContentType = "text/plain";

            context.Response.Write(callback + "(" + GetNews(_symbol, _pageNo, _pageSize) + ");");
            //context.Response.Write(SerializeDetailData(dt, _pageNo, _pageSize));
        }
        else if (_type == 8)
        {
            //Lay tin chi tiet            
            context.Response.ContentType = "text/plain";

            context.Response.Write(callback + "(" + GetNewDetails(_newsId) + ");");
        }
        else if (_type == 9)
        {
            //Lay thong tin cong ty
            context.Response.ContentType = "text/plain";
            context.Response.Write(callback + "(" + GetCompanyDetails(_symbol) + ");");
        }
        else if (_type == 10)
        {
            //Lay top 10 Price cho HNX
            context.Response.ContentType = "text/plain";
            context.Response.Write(callback + "(" + SerializeTopPriceData(GetTop10Price(_symbol, _topPriceType), _pageNo, _pageSize) + ");");
        }
        else if (_type == 11)
        {
            //Lay top 10 Price cho HNX
            context.Response.ContentType = "text/plain";
            context.Response.Write(callback + "(" + SerializeTopPriceData(GetOddLotPrice(_symbol, _topPriceType), _pageNo, _pageSize) + ");");
        }
        else if (_type == 3)
        {
            //Neu la 2 thi xuat anh chi tiet
            _width = 470;
            _height = 150;
            string fileName = "";
            byte[] image = null;
            if (_range != "")
            {
                switch (_range)
                {
                    case "1d":
                        fileName = "_INTRA_FULL";
                        image = DrawRealtimeFinancialChart(_symbol, fileName);
                        break;
                    case "1w":
                        fileName = "_1week";
                        image = DrawFinancialChart(_symbol, fileName, false);
                        break;
                    case "1m":
                        fileName = "_1month";
                        image = DrawFinancialChart(_symbol, fileName, false);
                        break;
                    case "3m":
                        fileName = "_3months";
                        image = DrawFinancialChart(_symbol, fileName, false);
                        break;
                    case "6m":
                        fileName = "_6months";
                        image = DrawFinancialChart(_symbol, fileName, false);
                        break;
                    case "1y":
                        fileName = "_year";
                        image = DrawFinancialChart(_symbol, fileName, false);
                        break;
                    case "all":
                        fileName = "_full";
                        image = DrawFinancialChart(_symbol, fileName, false);
                        break;
                }
            }

            context.Response.OutputStream.Write(image, 0, image.Length);
        }
        else if (_type == 5)
        {
            context.Response.ContentType = "text/plain";
            string fileName = "";
            DataTable dt = new DataTable();
            if (_range != "")
            {
                switch (_range)
                {
                    case "1d":
                        fileName = "_INTRA_FULL";
                        dt = CreateRealtimeFinancialChartData(_symbol, fileName);
                        break;
                    case "1w":
                        fileName = "_1week";
                        dt = CreateFinancialChartData(_symbol, fileName);
                        break;
                    case "1m":
                        fileName = "_1month";
                        dt = CreateFinancialChartData(_symbol, fileName);
                        break;
                    case "3m":
                        fileName = "_3months";
                        dt = CreateFinancialChartData(_symbol, fileName);
                        break;
                    case "6m":
                        fileName = "_6months";
                        dt = CreateFinancialChartData(_symbol, fileName);
                        break;
                    case "1y":
                        fileName = "_year";
                        dt = CreateFinancialChartData(_symbol, fileName);
                        break;
                    case "all":
                        fileName = "_full";
                        dt = CreateFinancialChartData(_symbol, fileName);
                        break;
                }
            }

            context.Response.Write(callback + SerializeData(dt));
            //context.Response.Write(GetJson(dt, 0));
        }
        else if (_type == 51)
        {
            context.Response.ContentType = "text/plain";
            string fileName = "";
            System.Data.DataSet ds = new System.Data.DataSet();
            if (_range != "")
            {
                switch (_range)
                {
                    case "all":
                        fileName = "_full";
                        ds = CreateFinancialChartDataWithEvents(_symbol, fileName);
                        break;
                    default:
                        break;
                }
            }

            context.Response.Write(callback + "(" + SerializePriceEventsData(ds) + ")");
            //context.Response.Write(GetJson(dt, 0));
        }
        else if (_type == 1)
        {
            bool showAll = false;
            if (context.Request["showAll"] != null)
            {
                showAll = true;
            }
            if (context.Request["separator"] != null)
            {
                int.TryParse(context.Request["separator"].ToString(), out _separator);
            }

            //create the Bitmap object
            Bitmap bitmap = new System.Drawing.Bitmap(_width * 3 + _separator * 3, _height * 3 + _separator * 3, PixelFormat.Format32bppPArgb);
            //create the Graphics object
            Graphics g = System.Drawing.Graphics.FromImage(bitmap);

            g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
            g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.High;
            g.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.HighQuality;
            bool check = false;

            //Neu la 1 thi la ghep toan bo anh index vao
            byte[] imgHOSE = CreateChart("VNIndex", false);
            byte[] imgVN30 = CreateChart("VN30", false);
            byte[] imgHNX = CreateChart("HNXIndex", false);
            byte[] imgHNX30 = CreateChart("HNX30", false);
            byte[] imgUPCOM = CreateChart("HNXUpcomIndex", false);

            if(showAll)
            {
                byte[] imgVN100 = CreateChart("VN100", false);
                byte[] imgVNALL = CreateChart("VNALL", false);
                byte[] imgVNMID = CreateChart("VNMID", false);
                byte[] imgVNSML = CreateChart("VNSML", false);
                byte[] imgHNXCon = CreateChart("HNXCon", false);
                byte[] imgHNXFFIndex = CreateChart("HNXFFIndex", false);
                byte[] imgHNXFin = CreateChart("HNXFin", false);
                byte[] imgHNXLCap = CreateChart("HNXLCap", false);
                byte[] imgHNXMan = CreateChart("HNXMan", false);
                byte[] imgHNXMSCap = CreateChart("HNXMSCap", false);

                if (imgVN100.Length > 0) { g.DrawImage(byteArrayToImage(imgVN100), new Point(_width * 2 + _separator, _height + _separator)); check = true; }

                if (imgVNALL.Length > 0) { g.DrawImage(byteArrayToImage(imgVNALL), new Point(_separator, _height * 2 + _separator)); check = true; }
                if (imgVNMID.Length > 0) { g.DrawImage(byteArrayToImage(imgVNMID), new Point(_width + _separator, _height * 2 + _separator)); check = true; }
                if (imgVNSML.Length > 0) { g.DrawImage(byteArrayToImage(imgVNSML), new Point(_width * 2 + _separator, _height * 2 + _separator)); check = true; }

                if (imgHNXCon.Length > 0) { g.DrawImage(byteArrayToImage(imgHNXCon), new Point(_separator, _height * 3 + _separator)); check = true; }
                if (imgHNXFFIndex.Length > 0) { g.DrawImage(byteArrayToImage(imgHNXFFIndex), new Point(_width + _separator, _height * 3 + _separator)); check = true; }
                if (imgHNXFin.Length > 0) { g.DrawImage(byteArrayToImage(imgHNXFin), new Point(_width * 2 + _separator, _height * 3 + _separator)); check = true; }

                if (imgHNXLCap.Length > 0) { g.DrawImage(byteArrayToImage(imgHNXLCap), new Point(_separator, _height * 4 + _separator)); check = true; }
                if (imgHNXMan.Length > 0) { g.DrawImage(byteArrayToImage(imgHNXMan), new Point(_width + _separator, _height * 4 + _separator)); check = true; }
                if (imgHNXMSCap.Length > 0) { g.DrawImage(byteArrayToImage(imgHNXMSCap), new Point(_width * 2 + _separator, _height * 4 + _separator)); check = true; }
            }

            if (imgHOSE.Length > 0) { g.DrawImage(byteArrayToImage(imgHOSE), new Point(_separator, _separator)); check = true; }
            if (imgHNX.Length > 0) { g.DrawImage(byteArrayToImage(imgHNX), new Point(_width + _separator, _separator)); check = true; }
            if (imgVN30.Length > 0) { g.DrawImage(byteArrayToImage(imgVN30), new Point(_width * 2 + _separator, _separator)); check = true; }

            if (imgHNX30.Length > 0) { g.DrawImage(byteArrayToImage(imgHNX30), new Point(_separator, _height + _separator)); check = true; }
            if (imgUPCOM.Length > 0) { g.DrawImage(byteArrayToImage(imgUPCOM), new Point(_width + _separator, _height + _separator)); check = true; }

            MemoryStream ms = new System.IO.MemoryStream(bitmap.Width * bitmap.Height);

            bitmap.Save(ms, System.Drawing.Imaging.ImageFormat.Png);

            byte[] res = ms.ToArray();
            if (res.Length > 0 && check && showAll)
                bitmap.Save(_chartPath + "\\index.png");

            context.Response.OutputStream.Write(res, 0, res.Length);
        }
    }

    public string CreateXML(Object YourClassObject)
    {
        XmlDocument xmlDoc = new XmlDocument();   //Represents an XML document, 
        // Initializes a new instance of the XmlDocument class.          
        XmlSerializer xmlSerializer = new XmlSerializer(YourClassObject.GetType());
        // Creates a stream whose backing store is memory. 
        using (MemoryStream xmlStream = new MemoryStream())
        {
            xmlSerializer.Serialize(xmlStream, YourClassObject);
            xmlStream.Position = 0;
            //Loads the XML document from the specified string.
            xmlDoc.Load(xmlStream);
            return xmlDoc.InnerXml;
        }
    }

    private string GetNewDetails(int id)
    {
        string result = "";
        DataTable dt = SqlHelper.ExecuteDataset(_cnn_str, "Company_GetNewDetails", id).Tables[0];
        result = GetJson(dt, 0);
        return result;
    }

    private string GetCompanyDetails(string symbol)
    {
        string result = "";
        DataTable dt = SqlHelper.ExecuteDataset(_cnn_str, "Company_GetStaticData", symbol).Tables[0];
        result = GetJson(dt, 0);
        return result;
    }

    private DataTable GetTop10Price(string symbol, string type)
    {
        DataTable dt = new DataTable();
        dt.Columns.Add("No");
        dt.Columns.Add("Price");
        dt.Columns.Add("Diff");
        dt.Columns.Add("Vol");
        if (type == "bid")
        {
            DataTable data = SqlHelper.ExecuteDataset(_cnn_str, "infogate_GetTopNPrice_Bid", symbol).Tables[0];
            if (data.Rows.Count > 0)
            {
                string[] prices = data.Rows[0]["Price"].ToString().Split('|');
                string[] volume = data.Rows[0]["Vol"].ToString().Split('|');
                double refPrice = double.Parse(data.Rows[0]["RefPrice"].ToString());

                if (prices.Length > 0)
                {
                    //Neu so luong gia < so luong KL thi gia 1 = 0
                    int no = 0;
                    if (prices.Length < volume.Length)
                    {
                        dt.Rows.Add(1, "ATC", 0, int.Parse(volume[0]));
                        no = 1;
                    }

                    for (int i = no; i < prices.Length; i++)
                    {
                        if (prices[i] != "" && volume[i] != "")
                        {
                            double price = double.Parse(prices[i]) / 1000;
                            double diff = price - refPrice;
                            if (price > 0)
                                dt.Rows.Add(i + 1, price, diff.ToString("N1"), int.Parse(volume[i]));
                        }
                    }
                }
            }
        }
        else
        {
            DataTable data = SqlHelper.ExecuteDataset(_cnn_str, "infogate_GetTopNPrice_Offer", symbol).Tables[0];
            if (data.Rows.Count > 0)
            {
                string[] prices = data.Rows[0]["Price"].ToString().Split('|');
                string[] volume = data.Rows[0]["Vol"].ToString().Split('|');
                double refPrice = double.Parse(data.Rows[0]["RefPrice"].ToString());

                if (prices.Length > 0)
                {
                    //Neu so luong gia < so luong KL thi gia 1 = 0
                    int no = 0;
                    if (prices.Length < volume.Length)
                    {
                        dt.Rows.Add(1, "ATC", 0, int.Parse(volume[0]));
                        no = 1;
                    }

                    for (int i = no; i < prices.Length; i++)
                    {
                        if (prices[i] != "" && volume[i] != "")
                        {
                            double price = double.Parse(prices[i]) / 1000;
                            double diff = price - refPrice;
                            if (price > 0)
                                dt.Rows.Add(i + 1, price, diff.ToString("N1"), int.Parse(volume[i]));
                        }
                    }
                }
            }
        }

        return dt;
    }

    private DataTable GetOddLotPrice(string symbol, string type)
    {
        DataTable dt = new DataTable();
        dt.Columns.Add("No");
        dt.Columns.Add("Price");
        dt.Columns.Add("Diff");
        dt.Columns.Add("Vol");
        if (type == "bid")
        {
            DataTable data = SqlHelper.ExecuteDataset(_cnn_str, "infogate_GetOddLot_Bid", symbol).Tables[0];
            if (data.Rows.Count > 0)
            {
                string[] prices = data.Rows[0]["Price"].ToString().Split('|');
                string[] volume = data.Rows[0]["Vol"].ToString().Split('|');
                double refPrice = double.Parse(data.Rows[0]["RefPrice"].ToString());

                if (prices.Length > 0)
                {
                    //Neu so luong gia < so luong KL thi gia 1 = 0
                    int no = 0;
                    if (prices.Length < volume.Length)
                    {
                        dt.Rows.Add(1, "ATC", 0, int.Parse(volume[0]));
                        no = 1;
                    }

                    for (int i = no; i < prices.Length; i++)
                    {
                        if (prices[i] != "" && volume[i] != "")
                        {
                            double price = double.Parse(prices[i]) / 1000;
                            double diff = price - refPrice;
                            if (price > 0)
                                dt.Rows.Add(i + 1, price, diff.ToString("N1"), int.Parse(volume[i]));
                        }
                    }
                }
            }
        }
        else
        {
            DataTable data = SqlHelper.ExecuteDataset(_cnn_str, "infogate_GetOddLot_Offer", symbol).Tables[0];
            if (data.Rows.Count > 0)
            {
                string[] prices = data.Rows[0]["Price"].ToString().Split('|');
                string[] volume = data.Rows[0]["Vol"].ToString().Split('|');
                double refPrice = double.Parse(data.Rows[0]["RefPrice"].ToString());

                if (prices.Length > 0)
                {
                    //Neu so luong gia < so luong KL thi gia 1 = 0
                    int no = 0;
                    if (prices.Length < volume.Length)
                    {
                        dt.Rows.Add(1, "ATC", 0, int.Parse(volume[0]));
                        no = 1;
                    }

                    for (int i = no; i < prices.Length; i++)
                    {
                        if (prices[i] != "" && volume[i] != "")
                        {
                            double price = double.Parse(prices[i]) / 1000;
                            double diff = price - refPrice;
                            if (price > 0)
                                dt.Rows.Add(i + 1, price, diff.ToString("N1"), int.Parse(volume[i]));
                        }
                    }
                }
            }
        }

        return dt;
    }

    private string GetNews(string symbol, int pageNo, int pageSize)
    {
        string result = "";
        DataTable dt = SqlHelper.ExecuteDataset(_cnn_str, "Company_GetNews", symbol, pageSize).Tables[0];
        if (dt.Rows.Count > 0)
        {
            int totalRecords = dt.Rows.Count;

            NewsClass cls = new NewsClass();
            cls.page = pageNo;
            cls.records = totalRecords;
            cls.rows = new NewsRows[dt.Rows.Count - (pageNo - 1) * pageSize];
            cls.total = (totalRecords / pageSize) + 1;

            int count = 0;
            for (int i = (pageNo - 1) * pageSize; i < dt.Rows.Count; i++)
            {
                //{"id":"1","cell":["1","2007-10-01","Client 1","100.00","20.00","120.00","note 1"]}
                //string time = DateTime.Parse(dt.Rows[i]["Time"].ToString()).Subtract(new DateTime(1970, 1, 1)).TotalMilliseconds.ToString();
                string time = DateTime.Parse(dt.Rows[i]["Time"].ToString()).ToString("dd/MM/yyyy HH:mm:ss");
                int id = int.Parse(dt.Rows[i]["ID"].ToString());
                string title = dt.Rows[i]["Title"].ToString();
                string content = dt.Rows[i]["Content"].ToString();
                string ticker = dt.Rows[i]["Ticker"].ToString();

                NewsRows rows = new NewsRows();
                rows.id = id;

                NewsRow row = new NewsRow();
                row.id = i + 1;
                row.time = time;
                row.title = title;
                row.ticker = ticker;
                rows.row = row;
                cls.rows[count] = rows;
                count++;
                if (count >= pageSize) break;
            }

            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            result = serializer.Serialize(cls);
        }

        return result;
    }

    public string GetJson(DataTable dt, int columnCount)
    {
        System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
        List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
        Dictionary<string, object> row = null;

        foreach (DataRow dr in dt.Rows)
        {
            row = new Dictionary<string, object>();
            if (columnCount == 0) columnCount = dt.Columns.Count;
            for (int i = 0; i < columnCount; i++)
            {
                row.Add(dt.Columns[i].ColumnName.Trim(), dr[i]);
            }
            rows.Add(row);
        }
        return serializer.Serialize(rows);
    }

    public string SerializeData(DataTable dt)
    {
        string result = "(\n[\n";
        for (int i = 0; i < dt.Rows.Count; i++)
        {
            string date = DateTime.Parse(dt.Rows[i]["Time"].ToString()).Subtract(new DateTime(1970, 1,1)).TotalMilliseconds.ToString();
            string openPrice = dt.Rows[i]["OpenPrice"].ToString();
            string highestPrice = dt.Rows[i]["Highest"].ToString();
            string lowestPrice = dt.Rows[i]["Lowest"].ToString();
            string closePrice = dt.Rows[i]["ClosePrice"].ToString();
            string vol = dt.Rows[i]["TotalShare"].ToString();

            string row = String.Format("[{0},{1},{2},{3},{4},{5}]", date, openPrice, highestPrice, lowestPrice, closePrice, vol);

            if (i < dt.Rows.Count - 1)
                row += ",\n";

            result += row;
        }
        result += "\n]);";
        return result;
    }

    public string SerializeDetailData(DataTable dt, int pageNo, int pageSize)
    {
        string result = "";
        //Load 20 ban ghi 1 lan
        int totalRecords = dt.Rows.Count;

        DetailDataClass cls = new DetailDataClass();
        cls.page = pageNo;
        cls.records = totalRecords;
        cls.rows = new DetailDataRows[dt.Rows.Count - (pageNo - 1) * pageSize];
        cls.total = (totalRecords / pageSize) + 1;

        int count = 0;
        for (int i = (pageNo - 1) * pageSize; i < dt.Rows.Count; i++)
        {
            //{"id":"1","cell":["1","2007-10-01","Client 1","100.00","20.00","120.00","note 1"]}
            //string time = DateTime.Parse(dt.Rows[i]["Time"].ToString()).Subtract(new DateTime(1970, 1, 1)).TotalMilliseconds.ToString();
            string time = DateTime.Parse(dt.Rows[dt.Rows.Count - i - 1]["Time"].ToString()).ToString("HH:mm:ss");
            string price = dt.Rows[dt.Rows.Count - i - 1]["Price"].ToString();
            string diff = dt.Rows[dt.Rows.Count - i - 1]["Diff"].ToString();
            string vol = dt.Rows[dt.Rows.Count - i - 1]["Volume"].ToString();

            DetailDataRows rows = new DetailDataRows();
            rows.id = i + 1;

            DetailDataRow row = new DetailDataRow();
            row.id = i + 1;
            row.time = time;
            row.price = double.Parse(price);
            row.vol = double.Parse(vol);
            row.diff = double.Parse(diff);

            rows.row = row;
            cls.rows[count] = rows;
            count++;
            if (count >= pageSize) break;
        }

        cls.userdata = new UserData();
        cls.userdata.amount = 0;
        cls.userdata.tax = 0;
        cls.userdata.total = 0;
        cls.userdata.name = "Totals:";

        System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
        result = serializer.Serialize(cls);

        //result = CreateXML(cls);
        return result;
    }

    public string SerializeTopPriceData(DataTable dt, int pageNo, int pageSize)
    {
        string result = "";
        //Load 20 ban ghi 1 lan
        int totalRecords = dt.Rows.Count;

        TopPriceDataClass cls = new TopPriceDataClass();
        cls.page = 1;
        cls.records = totalRecords;
        cls.rows = new TopPriceDataRows[dt.Rows.Count];
        cls.total = totalRecords;

        int count = 0;
        for (int i = 0; i < dt.Rows.Count ; i++)
        {
            //{"id":"1","cell":["1","2007-10-01","Client 1","100.00","20.00","120.00","note 1"]}
            string price = dt.Rows[i]["Price"].ToString();
            string diff = dt.Rows[i]["Diff"].ToString();
            string vol = dt.Rows[i]["Vol"].ToString();

            TopPriceDataRows rows = new TopPriceDataRows();
            rows.id = i + 1;

            TopPriceDataRow row = new TopPriceDataRow();
            row.id = i + 1;
            row.price = price;
            row.vol = double.Parse(vol);
            row.diff = double.Parse(diff);

            rows.row = row;
            cls.rows[count] = rows;
            count++;
        }

        System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
        result = serializer.Serialize(cls);

        //result = CreateXML(cls);
        return result;
    }

    public string SerializePriceEventsData(System.Data.DataSet ds)
    {
        string result = "";
        DataTable dt1 = ds.Tables[0];
        DataTable dt2 = ds.Tables[1];
        //Load 20 ban ghi 1 lan
        int total1Records = dt1.Rows.Count;
        int total2Records = dt2.Rows.Count;

        PriceEventsDataClass cls = new PriceEventsDataClass();
        cls.PriceRows = new PriceDataRow[dt1.Rows.Count];
        cls.price_rows = dt1.Rows.Count;

        int count = 0;
        for (int i = 0; i < dt1.Rows.Count; i++)
        {
            string date = DateTime.Parse(dt1.Rows[i]["Time"].ToString()).ToString("dd/MM/yyyy");
            string openPrice = dt1.Rows[i]["OpenPrice"].ToString();
            string highestPrice = dt1.Rows[i]["Highest"].ToString();
            string lowestPrice = dt1.Rows[i]["Lowest"].ToString();
            string closePrice = dt1.Rows[i]["ClosePrice"].ToString();
            string vol = dt1.Rows[i]["TotalShare"].ToString();

            PriceDataRow row = new PriceDataRow();
            row.id = i + 1;

            row.time = date;
            row.open = double.Parse(openPrice);
            row.high = double.Parse(highestPrice);
            row.low = double.Parse(lowestPrice);
            row.close = double.Parse(closePrice);
            row.vol = double.Parse(vol);

            cls.PriceRows[count] = row;
            count++;
        }

        cls.event_rows = dt2.Rows.Count;
        cls.EventRows = new EventDataRow[dt2.Rows.Count];
        count = 0;
        for (int i = 0; i < dt2.Rows.Count; i++)
        {
            try
            {
                string date = DateTime.Parse(dt2.Rows[i]["AnDate"].ToString()).ToString("dd/MM/yyyy");
                string ticker = dt2.Rows[i]["Ticker"].ToString();
                string eventName = dt2.Rows[i]["EventName"].ToString();
                string eventCode = dt2.Rows[i]["EventCode"].ToString();
                string eventDesc = dt2.Rows[i]["EventDesc"].ToString();

                EventDataRow row = new EventDataRow();
                row.id = i + 1;

                row.time = date;
                row.ticker = ticker;
                row.EventName = eventName;
                row.desc = eventDesc;

                cls.EventRows[count] = row;
                count++;
            }
            catch (Exception ex)
            {

            }
        }

        System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
        result = serializer.Serialize(cls);

        //result = CreateXML(cls);
        return result;
    }

    public Image byteArrayToImage(byte[] byteArrayIn)
    {
        if(byteArrayIn.Length > 0)
        {
            MemoryStream ms = new MemoryStream(byteArrayIn);
            Image returnImage = Image.FromStream(ms);
            return returnImage;
        }
        return null;
    }

    private byte[] CreateChart(string symbol, bool createChart)
    {
        byte[] image = new byte[] {};
        DataTable table ;
        if (_type == 0)
            table = CreateChartData(_symbol);
        else
            table = CreateChartData(symbol);
        double refIndex = 0;

        if (table.Rows.Count > 0)
        {
            // The data for the chart
            double[] indexIncrease = new double[table.Rows.Count];
            double[] indexDecrease = new double[table.Rows.Count];
            double[] volumes = new double[table.Rows.Count];
            double[] times = new double[table.Rows.Count];
            double maxVolume = 0;
            double matchVolume = 0, lastVolume = 0;
            double lastIndex = 0, index = 0;
            double preCloseIndex = 0;
            for (int i = 0; i < table.Rows.Count; i++)
            {
                DataRow row = table.Rows[i];
                DateTime dtm = DateTime.Parse(row[0].ToString());

                times[i] = dtm.ToOADate();
                index = double.Parse(row[1].ToString());

                if (dtm > DateTime.Today.AddHours(11).AddMinutes(29))
                {
                    preCloseIndex = index;

                    //Them du lieu tu 11h30 -> 13h00 vao
                    if (preCloseIndex > 0)
                    {
                        //Tu 11h30 -> 13h la de Index voi Vol = 0

                    }
                }

                if (index == 0) index = lastIndex;

                if (i == 0)
                    refIndex = double.Parse(row[2].ToString());

                if (index >= refIndex)
                {
                    indexIncrease[i] = index;
                    indexDecrease[i] = Chart.NoValue;
                }
                else
                {
                    indexDecrease[i] = index;
                    indexIncrease[i] = Chart.NoValue;
                }

                if (lastVolume == 0)
                    lastVolume = double.Parse(row[3].ToString());

                matchVolume = double.Parse(row[3].ToString());

                volumes[i] = matchVolume / 1000;

                if (volumes[i] > maxVolume)
                    maxVolume = volumes[i];

                if (lastIndex != index)
                    lastIndex = index;
            }

            for (int j = 1; j <= table.Rows.Count - 1; j++)
            {
                if (indexIncrease[j - 1] < Chart.NoValue && indexIncrease[j - 1] > refIndex && indexDecrease[j] > 0 &&
                    indexDecrease[j] < refIndex)
                {
                    indexIncrease[j] = refIndex;
                    try
                    {
                        if (indexDecrease[j + 1] > 0)
                        {
                            indexDecrease[j] = refIndex;
                        }
                        else
                        {
                            indexDecrease[j - 1] = refIndex;
                        }
                    }
                    catch (Exception ex)
                    {
                        indexDecrease[j - 1] = refIndex;
                    }
                }
                else if (indexDecrease[j - 1] > 0 && indexDecrease[j - 1] < refIndex && indexIncrease[j] > refIndex &&
                            indexIncrease[j] < Chart.NoValue)
                {
                    indexDecrease[j] = refIndex;
                    try
                    {
                        if (indexIncrease[j + 1] > 0)
                        {
                            indexIncrease[j] = refIndex;
                        }
                        else
                        {
                            indexIncrease[j - 1] = refIndex;
                        }
                    }
                    catch (Exception ex)
                    {
                        indexDecrease[j - 1] = refIndex;
                    }
                }

                if (indexIncrease[j] < 0)
                {
                    // have decrease data
                    indexIncrease[j] = Chart.NoValue;
                }
                if (indexDecrease[j] < 0)
                {
                    // have increase data
                    indexDecrease[j] = Chart.NoValue;
                }
            }

            XYChart c = new XYChart(_width, _height);
            PlotArea plotArea = c.setPlotArea(_separator + 30, _separator, _width - 80 - _separator, _height - 20 - _separator);

            TextBox title;
            if (_type == 1)
                title = c.addTitle(symbol);
            else
                title = c.addTitle(_symbol);

            title.setPos(_width / 2 - _width / 2, 10);
            title.setFontColor(0xFFFFFF);

            c = setGeneralProperties(c, refIndex, maxVolume);

            c.xAxis().setLabelStyle("Arial", 7);
            c.yAxis().setLabelStyle("Arial", 7);
            c.yAxis2().setLabelStyle("Arial", 7);
            /***************************
            Ref price
            ****************************/
            //Add a blue (0x0000ff) mark at $indexSeries[0] using a line width of 1.
            Mark refPriceMark = null;
            if (refIndex > 0)
            {
                refPriceMark = c.yAxis().addMark(refIndex, c.dashLineColor(0xFF7200, Chart.DashLine),
                                                    refIndex.ToString("N2"));
                refPriceMark.setLineWidth(1);
                refPriceMark.setFontSize(7);
                //refPriceMark.setAlignment(Chart.TopLeft);
            }
            c.setBackground(0x111a1b25);
            c.xAxis().setColors(0x8F8F8F, 0x8F8F8F, 0x8F8F8F);
            c.yAxis().setColors(0x8F8F8F, 0x8F8F8F, 0x8F8F8F);
            c.yAxis2().setColors(0x8F8F8F, 0x8F8F8F, 0x8F8F8F);
            plotArea.setBackground(0x111a1b25);
            plotArea.setGridColor(0x282828, 0x282828, -1, -1);

            //Add a line layer to for the first data set using red (0xc00000) color with a line
            LineLayer lineIncrease = c.addLineLayer();
            lineIncrease.addDataSet(indexIncrease, 0x00ff00);
            lineIncrease.setXData(times);
            lineIncrease.setLineWidth(1);

            LineLayer lineDecrease = c.addLineLayer2();
            lineDecrease.addDataSet(indexDecrease, 0xff0000);
            lineDecrease.setXData(times);
            lineDecrease.setLineWidth(1);

            BarLayer barLayer = c.addBarLayer(volumes, 0xEAF230);
            barLayer.setBarGap(0);
            //barLayer.addDataSet(volumes, 0xEAF230);
            barLayer.setBorderColor(0xEAF230);
            barLayer.setUseYAxis2();
            barLayer.setXData(times);
            barLayer.setBarGap(1);

            c.xAxis().setIndent(false);

            if (refPriceMark != null)
            {
                c.addInterLineLayer(refPriceMark.getLine(), lineIncrease.getLine(), unchecked((int)0x806FCCFF));
                c.addInterLineLayer(refPriceMark.getLine(), lineDecrease.getLine(), unchecked((int)0x80EFBF59));
            }

            /***************************
            Axis x: time
            ****************************/
            //Set the x-axis label format
            //c.xAxis().setLabelFormat("{value|hh:nn}");

            String[] labels = { "9:00", "-", "10:30", "-", "11:30", "-", "13:00", "-", "15:00" };
            //c.xAxis().setLabels(labels);

            // Add an orange (0xffcc66) zone from x = 18 to x = 20
            c.xAxis().addZone(DateTime.Today.AddHours(11).AddMinutes(30).ToOADate(),
                                        DateTime.Today.AddHours(13).ToOADate(), 0x282828);

            c.xAxis().setLinearScale(DateTime.Today.AddHours(9).ToOADate(),
                                        DateTime.Today.AddHours(15).ToOADate(), labels);

            c.xAxis().setMinTickInc(1800);

            ////c.makeChart(String.Format(_filePath + "/chart/{0}.png", _symbol));

            // Output the chart

            image = c.makeWebImage(Chart.PNG).image;

            //if (createChart)
            //    c.makeChart(_chartPath + "\\" + symbol + ".png");
        }

        return image;
    }

    public bool IsReusable {
        get {
            return false;
        }
    }

    private XYChart setGeneralProperties(XYChart c, double refIndex, double maxVolume)
    {
        c.setClipping();

        //Set the axes width to 2 pixels
        c.xAxis().setWidth(1);

        c.yAxis().setWidth(2);

        c.yAxis2().setWidth(2);
        c.yAxis2().setLabelFormat("{value} K");
        if (maxVolume < 4000)
        {
            c.yAxis2().setLinearScale(0, 4000, 500);
            c.yAxis2().setMinTickInc(500);
        }
        //c.yAxis2().setLinearScale(0, 2000, 500);

        return c;
    }

    private DataTable CreateChartData(string symbol)
    {
        DataTable table = new DataTable();
        table.Columns.Add("Time");
        table.Columns.Add("Index");
        table.Columns.Add("Ref");
        table.Columns.Add("Volume");

        //Load du lieu
        if (File.Exists(String.Format("{0}\\{1}\\{2}_INTRA_CHART.txt", _filePath, symbol, symbol)))
        {
            string[] lines = System.IO.File.ReadAllLines(String.Format("{0}\\{1}\\{2}_INTRA_CHART.txt", _filePath, symbol, symbol));

            table.Clear();
            foreach (string line in lines)
            {
                //08:45:41;425.04;425.29;1168.08 -- Thoi gian;Index;Index dau ngay;KL
                string[] values = line.Split(';');
                if (values.Length > 0)
                {
                    DateTime dtmDate = DateTime.Today;
                    string time = values[0];
                    string[] times = time.Split(':');
                    if (times.Length > 0)
                    {
                        int hour = int.Parse(times[0]);
                        if (hour < 3) hour += 12;
                        dtmDate = dtmDate.AddHours(hour).AddMinutes(int.Parse(times[1])).AddSeconds(int.Parse(times[2]));
                    }

                    double dblIndex = 0;
                    string currentIndex = values[1];
                    dblIndex = double.Parse(currentIndex);
                    if (dblIndex == 0) continue;

                    double dblRef = 0;
                    string refIndex = values[2];
                    dblRef = double.Parse(refIndex);

                    double dblVol = 0;
                    string vol = values[3];
                    dblVol = double.Parse(vol);

                    table.Rows.Add(dtmDate, dblIndex, dblRef, dblVol);
                }
            }
        }
        //Tra ra ket qua
        return table;
    }

    private DataTable CreateDetailsData(string symbol)
    {
        DataTable table = new DataTable();
        table.Columns.Add("Time");
        table.Columns.Add("Price");
        table.Columns.Add("Diff");
        table.Columns.Add("Volume");

        //Load du lieu
        if (File.Exists(String.Format("{0}\\{1}\\{2}_DETAILS.txt", _filePath, symbol, symbol)))
        {
            string[] lines = System.IO.File.ReadAllLines(String.Format("{0}\\{1}\\{2}_DETAILS.txt", _filePath, symbol, symbol));

            table.Clear();
            foreach (string line in lines)
            {
                //08:45:41;425.04;425.29;1168.08 -- Thoi gian;Index;Index dau ngay;KL
                string[] values = line.Split(',');
                if (values.Length > 0)
                {
                    DateTime dtmDate = DateTime.Today;
                    string time = values[0];
                    string[] times = time.Split(':');
                    if (times.Length > 0)
                    {
                        int hour = int.Parse(times[0]);
                        if (hour < 3) hour += 12;
                        dtmDate = dtmDate.AddHours(hour).AddMinutes(int.Parse(times[1])).AddSeconds(int.Parse(times[2]));
                    }

                    double dblIndex = 0;
                    string currentIndex = values[1];
                    dblIndex = double.Parse(currentIndex);
                    if (dblIndex == 0) continue;

                    double dblDiff = 0;
                    string strDiff = values[2];
                    dblDiff = double.Parse(strDiff);

                    double dblVol = 0;
                    string vol = values[3];
                    dblVol = double.Parse(vol);

                    if (dblIndex > 0 && dblVol > 0)
                        table.Rows.Add(dtmDate, dblIndex, dblDiff, dblVol);
                }
            }
        }
        //Tra ra ket qua
        return table;
    }

    private DataTable CreateRealtimeFinancialChartData(string symbol, string fileName)
    {
        DataTable table = new DataTable();
        table.Columns.Add("Time");
        table.Columns.Add("OpenPrice");
        table.Columns.Add("Highest");
        table.Columns.Add("Lowest");
        table.Columns.Add("ClosePrice");
        table.Columns.Add("TotalShare");

        //Load du lieu
        if (File.Exists(String.Format("{0}\\{1}\\{2}_INTRA_FULL.txt", _filePath, symbol, symbol)))
        {
            string[] lines = System.IO.File.ReadAllLines(String.Format("{0}\\{1}\\{2}{3}.txt", _filePath, symbol, symbol, fileName));

            table.Clear();
            foreach (string line in lines)
            {
                //08:45:41;425.04;425.29;1168.08 -- Thoi gian;Index;Index dau ngay;KL
                string[] values = line.Split(',');
                if (values.Length > 0)
                {
                    DateTime dtmDate = DateTime.Today;
                    string time = values[1];
                    string[] times = time.Split(':');
                    if (times.Length > 0)
                    {
                        int hour = int.Parse(times[0]);
                        if (hour < 3) hour += 12;
                        dtmDate = dtmDate.AddHours(hour).AddMinutes(int.Parse(times[1])).AddSeconds(int.Parse(times[2]));
                    }

                    double dblOpen = 0;
                    string currentOpen = values[2];
                    dblOpen = double.Parse(currentOpen);
                    if (dblOpen == 0) continue;

                    double dblHighest = 0;
                    string refHighest = values[3];
                    dblHighest = double.Parse(refHighest);

                    double dblLowest = 0;
                    string refLowest = values[4];
                    dblLowest = double.Parse(refLowest);

                    double dblClose = 0;
                    string refClose = values[5];
                    dblClose = double.Parse(refClose);

                    double dblVol = 0;
                    string strVol = values[6];
                    dblVol = double.Parse(strVol);

                    if (dblVol > 0)
                        table.Rows.Add(dtmDate, dblOpen, dblHighest, dblLowest, dblClose, dblVol);
                }
            }
        }
        //Tra ra ket qua
        return table;
    }

    private DataTable CreateFinancialChartData(string symbol, string fileName)
    {
        DataTable table = new DataTable();
        table.Columns.Add("Time");
        table.Columns.Add("OpenPrice");
        table.Columns.Add("Highest");
        table.Columns.Add("Lowest");
        table.Columns.Add("ClosePrice");
        table.Columns.Add("TotalShare");

        //Load du lieu
        if (File.Exists(String.Format("{0}\\{1}\\{2}{3}.txt", _filePath, symbol, symbol, fileName)))
        {
            string[] lines = System.IO.File.ReadAllLines(String.Format("{0}\\{1}\\{2}{3}.txt", _filePath, symbol, symbol, fileName));

            table.Clear();
            for (int i = lines.Length - 1; i >= 0; i--)
            {
                string line = lines[i];
                //08:45:41;425.04;425.29;1168.08 -- Thoi gian;Index;Index dau ngay;KL
                string[] values = line.Split(',');
                if (values.Length > 0)
                {
                    DateTime dtmDate = DateTime.Today;
                    string time = values[1];
                    int day = int.Parse(time.Substring(time.Length - 2));
                    int month = int.Parse(time.Substring(time.Length - 4, 2));
                    int year = int.Parse(time.Substring(0, 4));
                    dtmDate = new DateTime(year, month, day);

                    double dblOpen = 0;
                    string currentOpen = values[2];
                    dblOpen = double.Parse(currentOpen);
                    if (dblOpen == 0) continue;

                    double dblHighest = 0;
                    string refHighest = values[3];
                    dblHighest = double.Parse(refHighest);

                    double dblLowest = 0;
                    string refLowest = values[4];
                    dblLowest = double.Parse(refLowest);

                    double dblClose = 0;
                    string refClose = values[5];
                    dblClose = double.Parse(refClose);

                    double dblVol = 0;
                    string strVol = values[6];
                    dblVol = double.Parse(strVol);

                    table.Rows.Add(dtmDate, dblOpen, dblHighest, dblLowest, dblClose, dblVol);
                }
            }
        }
        //Tra ra ket qua
        return table;
    }

    private System.Data.DataSet CreateFinancialChartDataWithEvents(string symbol, string fileName)
    {
        System.Data.DataSet ds = new System.Data.DataSet();
        DataTable table = new DataTable();
        table.Columns.Add("Time");
        table.Columns.Add("OpenPrice");
        table.Columns.Add("Highest");
        table.Columns.Add("Lowest");
        table.Columns.Add("ClosePrice");
        table.Columns.Add("TotalShare");

        //Load du lieu
        if (File.Exists(String.Format("{0}\\{1}\\{2}{3}.txt", _filePath, symbol, symbol, fileName)))
        {
            string[] lines = System.IO.File.ReadAllLines(String.Format("{0}\\{1}\\{2}{3}.txt", _filePath, symbol, symbol, fileName));

            table.Clear();
            for (int i = lines.Length - 1; i >= 0; i--)
            {
                string line = lines[i];
                //08:45:41;425.04;425.29;1168.08 -- Thoi gian;Index;Index dau ngay;KL
                string[] values = line.Split(',');
                if (values.Length > 0)
                {
                    DateTime dtmDate = DateTime.Today;
                    string time = values[1];
                    int day = int.Parse(time.Substring(time.Length - 2));
                    int month = int.Parse(time.Substring(time.Length - 4, 2));
                    int year = int.Parse(time.Substring(0, 4));
                    dtmDate = new DateTime(year, month, day);

                    double dblOpen = 0;
                    string currentOpen = values[2];
                    dblOpen = double.Parse(currentOpen);
                    if (dblOpen == 0) continue;

                    double dblHighest = 0;
                    string refHighest = values[3];
                    dblHighest = double.Parse(refHighest);

                    double dblLowest = 0;
                    string refLowest = values[4];
                    dblLowest = double.Parse(refLowest);

                    double dblClose = 0;
                    string refClose = values[5];
                    dblClose = double.Parse(refClose);

                    double dblVol = 0;
                    string strVol = values[6];
                    dblVol = double.Parse(strVol);

                    table.Rows.Add(dtmDate, dblOpen, dblHighest, dblLowest, dblClose, dblVol);
                }
            }
        }
        ds.Tables.Add(table);

        DataTable eventDt = SqlHelper.ExecuteDataset(_cnn_str, "Company_GetEvents", symbol).Tables[0];
        for (int i = 0; i < eventDt.Rows.Count; i++)
        {
            eventDt.Rows[i]["EventDesc"] = WebRegEx.RemoveAllTag(eventDt.Rows[i]["EventDesc"].ToString());
        }

        DataTable newDt = new DataTable();
        newDt.Merge(eventDt);

        ds.Tables.Add(newDt);

        //Tra ra ket qua
        return ds;
    }

    private void GetData(DataTable dt, out DateTime[] times, out double[] open, out double[] high, out double[] low, out double[] close, out double[] vol)
    {
        times = new DateTime[dt.Rows.Count];
        open = new double[dt.Rows.Count];
        high = new double[dt.Rows.Count];
        low = new double[dt.Rows.Count];
        close = new double[dt.Rows.Count];
        vol = new double[dt.Rows.Count];
        int index=0;
        for (int i = 0; i < dt.Rows.Count; i++)
        {
            DateTime dtmTime = DateTime.Parse(dt.Rows[i]["Time"].ToString());
            double dblOpen = double.Parse(dt.Rows[i]["OpenPrice"].ToString());
            double dblHighest = double.Parse(dt.Rows[i]["Highest"].ToString());
            double dblLowest = double.Parse(dt.Rows[i]["Lowest"].ToString());
            double dblClose = double.Parse(dt.Rows[i]["ClosePrice"].ToString());
            double dblVol = double.Parse(dt.Rows[i]["TotalShare"].ToString());

            if (dblVol > 0)
            {
                times[index] = dtmTime;
                open[index] = dblOpen;
                high[index] = dblHighest;
                low[index] = dblLowest;
                close[index] = dblClose;
                vol[index] = dblVol;
                index++;
            }
        }
    }

    private byte[] DrawRealtimeFinancialChart(string symbol, string fileName)
    {
        byte[] image = new byte[] {};

        // To compute moving averages starting from the first day, we need to get extra
        // data points before the first day
        int extraDays = 0;

        // In this exammple, we use a random number generator utility to simulate the
        // data. We set up the random table to create 6 cols x (noOfDays + extraDays)
        // rows, using 9 as the seed.
        double[] highData, lowData, openData, closeData, volData;
        DateTime[] timeStamps;
        GetData(CreateRealtimeFinancialChartData(symbol, fileName), out timeStamps, out openData, out highData, out lowData, out closeData, out volData);

        // Create a FinanceChart object of width 640 pixels
        FinanceChart c = new FinanceChart(_width);

        // Add a title to the chart
        //c.addTitle(symbol);

        // Set the data into the finance chart object
        c.setData(timeStamps, highData, lowData, openData, closeData, volData, extraDays)
            ;

        // Add the main chart with 240 pixels in height
        c.addMainChart(_height);

        // Add a 10 period simple moving average to the main chart, using brown color
        c.addSimpleMovingAvg(10, 0x663300);

        // Add a 20 period simple moving average to the main chart, using purple color
        c.addSimpleMovingAvg(20, 0x9900ff);

        // Add an HLOC symbols to the main chart, using green/red for up/down days
        //c.addHLOC(0x008000, 0xcc0000);

        // Add an HLOC symbols to the main chart, using green/red for up/down days
        c.addCloseLine(0x008000);

        // Add 20 days bollinger band to the main chart, using light blue (9999ff) as the
        // border and semi-transparent blue (c06666ff) as the fill color
        //c.addBollingerBand(20, 2, 0x9999ff, unchecked((int)0xc06666ff));

        // Add a 75 pixels volume bars sub-chart to the bottom of the main chart, using
        // green/red/grey for up/down/flat days
        c.addVolBars(75, 0x99ff99, 0xff9999, 0x808080);

        // Output the chart
        image = c.makeWebImage(Chart.PNG).image;

        return image;
    }

    private byte[] DrawFinancialChart(string symbol, string fileName, bool disableLegend)
    {
        byte[] image = new byte[] { };

        // To compute moving averages starting from the first day, we need to get extra
        // data points before the first day
        int extraDays = 60;

        // In this exammple, we use a random number generator utility to simulate the
        // data. We set up the random table to create 6 cols x (noOfDays + extraDays)
        // rows, using 9 as the seed.
        double[] highData, lowData, openData, closeData, volData;
        DateTime[] timeStamps;
        GetData(CreateFinancialChartData(symbol, fileName), out timeStamps, out openData, out highData, out lowData, out closeData, out volData);

        // Create a FinanceChart object of width 640 pixels
        FinanceChart c = new FinanceChart(_width);

        // Add a title to the chart
        //c.addTitle(symbol);

        // Set the data into the finance chart object
        c.setData(timeStamps, highData, lowData, openData, closeData, volData, 0);

        //c.setDateLabelSpacing(extraDays);

        // Add a slow stochastic chart (75 pixels high) with %K = 14 and %D = 3
        //c.addSlowStochastic(75, 14, 3, 0x006060, 0x606000);

        // Add the main chart with 240 pixels in height
        XYChart chart =  c.addMainChart(_height);

        // Add an HLOC symbols to the main chart, using green/red for up/down days
        c.addCandleStick(0x00ff00, 0xff0000);

        if (!disableLegend)
        {
            // Add a 10 period simple moving average to the main chart, using brown color
            c.addSimpleMovingAvg(10, 0x663300);

            // Add a 20 period simple moving average to the main chart, using purple color
            c.addSimpleMovingAvg(20, 0x9900ff);

            // Add 20 days donchian channel to the main chart, using light blue (9999ff) as
            // the border and semi-transparent blue (c06666ff) as the fill color
            //c.addDonchianChannel(20, 0x9999ff, unchecked((int)0xc06666ff));

            // Add 20 days bollinger band to the main chart, using light blue (9999ff) as the
            // border and semi-transparent blue (c06666ff) as the fill color
            //c.addBollingerBand(20, 2, 0x9999ff, unchecked((int)0xc06666ff));

            // Add a 75 pixels volume bars sub-chart to the bottom of the main chart, using
            // green/red/grey for up/down/flat days
            c.addVolBars(75, 0x99ff99, 0xff9999, 0x808080);

            // Append a MACD(26, 12) indicator chart (75 pixels high) after the main chart,
            // using 9 days for computing divergence.
            //c.addMACD(75, 26, 12, 9, 0x0000ff, 0xff00ff, 0x008000);
        }
        else
        {
            //c.getLegend().setPos(-9999, -9999);
            //PlotArea plotArea = chart.setPlotArea(100, 0, 100, 50);
        }

        // Output the chart
        image = c.makeWebImage(Chart.PNG).image;

        return image;
    }
}