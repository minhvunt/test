
// JavaScript Document
AV.Options.definitions.volColor = 1;
AV.Options.definitions.hideColumns = [
	1, //Gia P1
    1, //KL P1
    1, //Gia P2
    1, //KL P2
    1, //KL Mua
    1, //KL Ban
    1, //SL Mua
    1, //SL Ban
    0, //NN Mua
    0, //NN Ban
    0, //Room con lai
    1,  //Tong Room
    1, //AVGVol
    1   //Open price
];

AV.Options.definitions.showIndexes = [
	0, //VNINDEX
    1, //VN100
    0, //VN30
    1, //VNALL
    1, //VNMID
    1, //VNSML
    0, //HNXINdex
    1, //HNX30
    1, //HNXCon
    1, //HNXFFIndex
    1, //HNXFin
    1, //HNXLCap
    1, //HNXMan
    1, //HNXMSCap
    0, //UPCOMIndex
    1, //HNXTRI

    1, //VNCOND
    1, //VNCONS
    1, //VNENE
    1, //VNFIN
    1, //VNHEAL
    1, //VNIND
    1, //VNIT
    1, //VNMAT
    1, //VNREAL
    1, //VNUTI
    0 //VNXALL
];

AV.ExecQueue.add(function() {
    AV.StockBoard.Menu.prototype.showMenu = function() {
        $('#Dialog-StockBoard-Options').hide();
        $('#sub-menu').toggle();
        var offset = $('#top-rightmenu').position();
        $('#sub-menu').css({ left: (AV.clientWidth() - $('#sub-menu').width() - 18) + 'px', top: ((offset ? offset.top : 0) + 25) + 'px', position: 'fixed' });
        Stock.isShowMenu = true;
    };
}, function () {
    return AV.StockBoard && AV.StockBoard.Menu;
    }, function () {
        
    }
);