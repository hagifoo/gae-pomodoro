from domain.entity import Team, Timer, Slack
from infra import firebase, taskqueue


class TeamRepository(object):
    def __init__(self):
        self._teams = {}

    def get(self, id_):
        team_json = firebase.fetch_team(id_)
        if not team_json:
            return None
        else:
            j = team_json
            j['id'] = id_
            return self._build(j)

    def get_by_invitation_code(self, invitation_code):
        teams_json = firebase.fetch_team_by_invitation_code(invitation_code)
        if not teams_json:
            return None
        else:
            id_ = teams_json.keys()[0]
            j = teams_json[id_]
            j['id'] = id_
            return self._build(j)

    #TODO: this method should be removed from this class
    def add_pomodoro(self, team):
        return firebase.add_team_pomodoro(
            team.timer.start_at,
            team.timer.pomodoro_time,
            team
        )

    def _build(self, j):
        team = Team(
            id=j.get('id'),
            name=j.get('name'),
            members=j.get('users', {}),
            scope=j.get('scope', '')
        )

        t = self._build_timer(team, j.get('timer', {}))
        team.set_timer(t)

        s = self._build_slack(team, j.get('slack', {}))
        team.set_slack(s)

        self._teams[team.id] = team
        return team

    def _build_timer(self, team, j):
        return Timer(
            owner=team,
            start_at=int(j.get('startAt', 0)),
            pomodoro_time=int(j.get('pomodoroTime', 1500)),
            break_time=int(j.get('breakTime', 300)),
            taskqueue=taskqueue.TeamTimerTaskqueue(team.id),
            firebase=firebase.TeamTimerFirebase(team.id)
        )

    def _build_slack(self, team, j):
        return Slack(
            owner=team,
            firebase=firebase.TeamSlack(team.id),
            name=j.get('name'),
            domain=j.get('domain'),
            channel_id=j.get('channelId'),
            mention=j.get('mention')
        )
