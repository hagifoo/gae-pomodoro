const Backbone = require('backbone');
require('backbone.marionette');
const d3 = require('d3');
const moment = require('moment');
const _ = require('underscore');

module.exports = Backbone.Marionette.View.extend({
    template: false,
    initialize: function(params) {
        this._width = params.width;
        this._height = params.height;
        this._selector = params.selector;

        this.model.on('change', _.bind(this.render, this));
    },

    onRender: function() {
        d3.select(this.$el[0]).select('svg').remove();
        if(this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
        let svg = d3.select(this.$el[0]).append('svg')
            .attr('width', this._width)
            .attr('height', this._height);

        let center = svg.append('g')
            .classed('user-timer', true)
            .attr('transform',
            `translate(${this._width/2}, ${this._height/2})`);

        this._render(center);
        this._intervalId = setInterval(() => {
            this._render(center);
        }, 1000);

        return this;
    },

    onBeforeDetach: function() {
        if(this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
    },

    _render: function(parent) {
        let now = moment();
        if(this.model.onPomodoro(now)) {
            parent.classed('on-pomodoro', true);
            parent.classed('on-break', false);
            let remaining = this.model.remainingPomodoroTime();
            let pomodoroTime = this.model.get('pomodoroTime');
            let fromRad = (pomodoroTime - remaining) / pomodoroTime * Math.PI * 2;
            let r = remaining;
            this.renderArc(parent, fromRad);
            this.renderText(parent, this.timeToString(r));
        } else if(this.model.onBreak(now)) {
            parent.classed('on-pomodoro', false);
            parent.classed('on-break', true);
            let remaining = this.model.remainingBreakTime();
            let breakTime = this.model.get('breakTime');
            let fromRad = (breakTime - remaining) / breakTime * Math.PI * 2;
            let r = remaining;
            this.renderArc(parent, fromRad);
            this.renderText(parent, this.timeToString(r));
        } else {
            parent.classed('on-pomodoro', false);
            parent.classed('on-break', false);
            this.renderArc(parent, 0);
            let r = this.model.get('pomodoroTime');
            this.renderText(parent, this.timeToString(r));
        }
    },

    timeToString: function(time) {
        let min = ('00' + Math.floor(time / 60)).slice(-2);
        let sec = ('00' + time % 60).slice(-2);
        return `${min}:${sec}`;
    },

    renderText: function(parent, text) {
        d3.select('.user-timer-text').remove();
        parent.append('text')
            .classed('user-timer-text', true)
            .text(text);
    },

    renderArc: function(parent, fromRad) {
        d3.select('.user-timer-arc').remove();

        let r = this._width / 2 - 16;
        let arc = d3.arc()
            .innerRadius(r - 24)
            .outerRadius(r)
            .startAngle(fromRad)
            .endAngle(Math.PI * 2);

        parent.append('path')
            .classed('user-timer-arc', true)
            .attr('d', arc);
    }
});
