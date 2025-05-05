from locust import HttpUser, task, between, LoadTestShape
import random, string, os, urllib.parse as up

PASTE_HOST = "http://pastebin-alb-1223430401.ap-east-1.elb.amazonaws.com:3000"
AN_HOST    = "http://pastebin-alb-1223430401.ap-east-1.elb.amazonaws.com:3002"
SLUGS = [l.strip() for l in open("slugs.txt")] if os.path.isfile("slugs.txt") else ["g8RB3Nm4"]

def rnd_txt():
    import random, string
    return "".join(random.choices(string.ascii_letters + string.digits + " ",
                                  k=random.randint(500, 5000)))

class AnalyticsUser(HttpUser):
    host = PASTE_HOST
    wait_time = between(0.5, 2)

    @task(9)                     # 180 : 20  ==  9 : 1
    def read_and_log(self):
        slug = random.choice(SLUGS)
        self.client.get(f"/api/pastes/{slug}", name="GET /pastes/:slug")

        self.client.get(
            f"{AN_HOST}/api/v1/analytics/paste/{slug}/timeline"
            "?startDate=2025-05-01&endDate=2025-06-05",
            name="GET /analytics/:slug"
        )

    @task(1)
    def create(self):
        self.client.post("/api/pastes",
                         json={"content": rnd_txt(),
                               "expirationType": "never"},
                         name="POST /pastes")

class AnalyticsShape(LoadTestShape):
    """200 users for 15 minutes."""
    def tick(self):
        return (200, 10) if self.get_run_time() < 900 else None
