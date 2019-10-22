<%@ WebHandler Language="C#" Class="DashboardHandler" %>

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

public class DashboardHandler : IHttpHandler {

    private string _symbol = "";
    private string _filePath = System.Configuration.ConfigurationSettings.AppSettings["FilePath"];
    private string _chartPath = System.Configuration.ConfigurationSettings.AppSettings["ChartPath"];
    private int _width = int.Parse(System.Configuration.ConfigurationSettings.AppSettings["Width"]);
    private int _height = int.Parse(System.Configuration.ConfigurationSettings.AppSettings["Height"]);
    private string _cnn_str = System.Configuration.ConfigurationSettings.AppSettings["CNN_STR"];
    private int _type = 0;
    private string _range = "";
    private int _pageNo = 1;
    private int _pageSize = 20;
    private int _newsId = -1;
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";

        //Lay tin chi tiet
        string callback = context.Request["callback"];
        if (callback == null)
            callback = "callback";
        
        //Lay du lieu bieu do Index theo ngay
        if (context.Request["type"] != null)
        {
            _type = int.Parse(context.Request["type"]);

            switch (_type)
            {
                case 1:
                    break;
            }
        }
    }

    private void GetIndexChart(string indexName)
    {
        //Tim ra 2 ngay giao dich gan nhat
        DataTable dtmLastDate = SqlHelper.ExecuteDataset(_cnn_str, "Dashboard_GetVNIndex_ByDate").Tables[0];

        if (dtmLastDate.Rows.Count > 0)
        {
            DateTime currentDate = DateTime.Parse(dtmLastDate.Rows[0]["CurrentDate"].ToString());
            DateTime lastDate = DateTime.Parse(dtmLastDate.Rows[0]["LastDate"].ToString());
            
            //Lay du lieu tu 2 file tuong ung
            string currentFileName = String.Format("{0}_{1}",indexName, currentDate.ToString("yyyyMMdd"));
            string lastFileName = String.Format("{0}_{1}",indexName, lastDate.ToString("yyyyMMdd"));
            
            //Cho du lieu vao bang
            DataTable dtCurrent = CreateChartData(currentFileName);
            DataTable dtLast = CreateChartData(lastFileName);
        }
    }

    private DataTable CreateChartData(string filePath)
    {
        DataTable table = new DataTable();
        table.Columns.Add("Time");
        table.Columns.Add("Index");
        table.Columns.Add("Ref");
        table.Columns.Add("Volume");

        //Load du lieu
        if (File.Exists(String.Format("{0}\\{1}", _filePath, filePath)))
        {
            string[] lines = System.IO.File.ReadAllLines(String.Format("{0}\\{1}", _filePath, filePath));

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
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}