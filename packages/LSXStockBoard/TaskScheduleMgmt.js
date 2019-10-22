Stock.TaskScheduleMgmt = AV.extend(AV.Module, {
    draw: function() {
        return AV.template('TaskScheduleMgmt', this);
    }
});