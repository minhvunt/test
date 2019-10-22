Stock.ProfileMgmt = AV.extend(AV.Module, {
    draw: function() {
        return AV.template('ProfileMgmt', this);
    }
});