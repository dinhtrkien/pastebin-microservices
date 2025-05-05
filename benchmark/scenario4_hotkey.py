from locust import HttpUser, task, between, LoadTestShape
import random, string, os

HOST = "http://pastebin-alb-1223430401.ap-east-1.elb.amazonaws.com:3000"

def load():
    if os.path.isfile("slugs.txt"):
        sl = [s.strip() for s in open("slugs.txt") if s.strip()]
        return sl, sl[:max(1, len(sl)//10)]      # all, top-10 %
    base = ["g8RB3Nm4"]
    return base, base
ALL_SLUGS, HOT_SLUGS = load()

def rand_text():
    alpha = string.ascii_letters + string.digits + " "
    return "".join(random.choices(alpha, k=random.randint(500, 5000)))

class HotKeyUser(HttpUser):
    host = HOST
    wait_time = between(0.5, 2)

    @task(10)                    # 70 % hot-key reads inside
    def read(self):
        pool = HOT_SLUGS if random.random() < 0.7 else ALL_SLUGS
        slug = random.choice(pool)
        self.client.get(f"/api/pastes/{slug}", name="GET /pastes/:slug")

    @task(1)
    def write(self):
        self.client.post("/api/pastes",
                         json={"content": rand_text(),
                               "expirationType": "never"},
                         name="POST /pastes")

class HotKeyShape(LoadTestShape):
    """500 users for 10 minutes."""
    def tick(self):
        return (500, 20) if self.get_run_time() < 600 else None
