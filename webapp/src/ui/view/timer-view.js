var d3 = require('d3');
var moment = require('moment');

class TimerView {
    constructor(timer, width, height, selector) {
        this._timer = timer;
        this._width = width;
        this._height = height;
        this._selector = selector;
    }

    render() {
        var svg = d3.select(this._selector).append('svg')
            .attr('width', this._width)
            .attr('height', this._height);

        var center = svg.append('g')
            .attr('transform',
            `translate(${this._width/2}, ${this._height/2})`);

        setInterval(() => {
            var now = moment();
            if(!this._timer.startAt) {
                this._timer.startAt = now.unix();
            }
            let dt = now.unix() - this._timer.startAt;
            var fromRad = dt / this._timer.pomodoroPeriod * Math.PI * 2;
            let r = this._timer.pomodoroPeriod - dt;
            this.renderArc(center, fromRad);
            this.renderText(center, `${Math.floor(r/60)}:${r%60}`);
        }, 1000);
    }
    renderText(parent, text) {
    d3.select('.user-timer-text').remove();
        parent.append('text')
            .classed('user-timer-text', true)
            .text(text);
    }
    renderArc(parent, fromRad) {
        d3.select('.user-timer-arc').remove();

        var r = this._width / 2 - 16;
        var arc = d3.arc()
            .innerRadius(r - 24)
            .outerRadius(r)
            .startAngle(fromRad)
            .endAngle(Math.PI * 2);

        parent.append('path')
            .classed('user-timer-arc', true)
            .attr('d', arc);
    }
};

module.exports = TimerView;
