<%@ page language="C#" autoeventwireup="true" inherits="BasicChart, App_Web_jgewabdb" %>
<%@ Register assembly="netchartdir" namespace="ChartDirector" tagprefix="chart" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <link href="css/css.css" rel="stylesheet" type="text/css" />
</head>
<body>
    <form id="form1" runat="server">
    <div id="HOSE"><chart:WebChartViewer ID="chartHOSE" runat="server"/></div>
    <div id="HNX"><chart:WebChartViewer ID="chartHNX" runat="server"/></div>
    <div id="UPCOM"><chart:WebChartViewer ID="chartUPCOM" runat="server"/></div>
    <div id="VN30"><chart:WebChartViewer ID="chartVN30" runat="server"/></div>
    <div id="HNX30"><chart:WebChartViewer ID="chartHNX30" runat="server"/></div>
    </form>
</body>
</html>
