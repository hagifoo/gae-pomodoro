var d3 = require('d3');
var moment = require('moment');
var _ = require('underscore');

class TimerView {
    constructor(timer, width, height, selector) {
        this._timer = timer;
        this._width = width;
        this._height = height;
        this._selector = selector;

        this._timer.on('change', _.bind(this.render, this));
    }

    render() {
        d3.select(this._selector).select('svg').remove();
        if(this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
        var svg = d3.select(this._selector).append('svg')
            .attr('width', this._width)
            .attr('height', this._height);

        var center = svg.append('g')
            .classed('user-timer', true)
            .attr('transform',
            `translate(${this._width/2}, ${this._height/2})`);

        this._render(center);
        this._intervalId = setInterval(() => {
            this._render(center);
        }, 1000);
    }
    _render(parent) {
        var now = moment();
        if(this._timer.onPomodoro(now)) {
            parent.classed('on-pomodoro', true);
            parent.classed('on-break', false);
            let remaining = this._timer.remainingPomodoroTime();
            let pomodoroTime = this._timer.get('pomodoroTime');
            let fromRad = (pomodoroTime - remaining) / pomodoroTime * Math.PI * 2;
            let r = remaining;
            this.renderArc(parent, fromRad);
            this.renderText(parent, this.timeToString(r));
        } else if(this._timer.onBreak(now)) {
            parent.classed('on-pomodoro', false);
            parent.classed('on-break', true);
            let remaining = this._timer.remainingBreakTime();
            let breakTime = this._timer.get('breakTime');
            let fromRad = (breakTime - remaining) / breakTime * Math.PI * 2;
            let r = remaining;
            this.renderArc(parent, fromRad);
            this.renderText(parent, this.timeToString(r));
        } else {
            parent.classed('on-pomodoro', false);
            parent.classed('on-break', false);
            this.renderArc(parent, 0);
            let r = this._timer.get('pomodoroTime');
            this.renderText(parent, this.timeToString(r));
        }
    }
    timeToString(time) {
        let min = ('00' + Math.floor(time / 60)).slice(-2);
        let sec = ('00' + time % 60).slice(-2);
        return `${min}:${sec}`;
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
