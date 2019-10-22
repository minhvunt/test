<%@ Page Language="C#" AutoEventWireup="true" Inherits="StockBoard.WebServer.HeatMap" Codebehind="HeatMap.aspx.cs" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>HEAT MAP</title>
    <script type="text/javascript" src="https://www.google.com/jsapi"></script>
</head>
<body>
    <form id="form1" runat="server">
        <div id="filter_heatmap">
            <table width="100%" cellpadding="2" cellspacing="2">
                <tr>
                    <td width="50">
                        <asp:Label ID="lblFloorCode" runat="server" Text="Sàn : "></asp:Label>
                    </td>
                    <td>
                        <asp:DropDownList ID="ddlFloorCode" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlFloorCode_SelectedIndexChanged">
                            <asp:ListItem Selected="True" Value="all">Toàn thị trường</asp:ListItem>
                            <asp:ListItem Value="ho">HOSE</asp:ListItem>
                            <asp:ListItem Value="hnx">HNX</asp:ListItem>
                            <asp:ListItem Value="upc">UPCOM</asp:ListItem>
                        </asp:DropDownList>
                    </td>
                    <td width="80">
                        <asp:Label ID="lblSector" runat="server" Text="Bộ chỉ số : "></asp:Label>
                    </td>
                    <td>
                        <asp:DropDownList ID="ddlSector" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlSector_SelectedIndexChanged">
                            <asp:ListItem Value="all">Tất cả</asp:ListItem>
                        </asp:DropDownList>
                    </td>
                    <td width="80">
                        <asp:Label ID="lblSummary" runat="server" Text="Bộ lọc : "></asp:Label>
                    </td>
                    <td>
                        <asp:DropDownList ID="ddlSummary" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlSummary_SelectedIndexChanged">
                            <asp:ListItem Selected="True" Value="klgd">Khối lượng GD</asp:ListItem>
                            <asp:ListItem Value="gtgd">Giá trị GD</asp:ListItem>
                            <asp:ListItem Value="nnm">NN Mua</asp:ListItem>
                        </asp:DropDownList>
                    </td>
                </tr>
            </table>
        </div>
        <div id="visualization" style="width: 800px; height: 500px;"></div>
    </form>
    <script type="text/javascript">
        function myClickHandler() {
            var selection = tree.getSelection();
            for (var i = 0; i < selection.length; i++) {
                var item = selection[i];

                var symbol = data[item.row - 1];
                if (symbol != '') {
                    OpenInNewTab('http://vfpress.vn/chung-khoan/chi-tiet?q=' + symbol);
                }
                break;
            }
        }

        function OpenInNewTab(url) {
            var win = window.open(url, '_blank');
            win.focus();
        }
    </script>
</body>
</html>
