from locust import HttpUser, task, between, LoadTestShape
import random, string, os

HOST = "http://pastebin-alb-1223430401.ap-east-1.elb.amazonaws.com:3000"
SLUGS = [l.strip() for l in open("slugs.txt")] if os.path.isfile("slugs.txt") else ["g8RB3Nm4"]

def body():
    import random, string
    return "".join(random.choices(string.ascii_letters + string.digits + " ",
                                  k=random.randint(500, 5000)))

class RampUser(HttpUser):
    host = HOST
    wait_time = between(0.5, 2)

    @task(10)                    # 10 : 1 read/write mix
    def read(self):
        self.client.get(f"/api/pastes/{random.choice(SLUGS)}",
                         name="GET /pastes/:slug")

    @task(1)
    def write(self):
        self.client.post("/api/pastes",
                         json={"content": body(),
                               "expirationType": "never"},
                         name="POST /pastes")

class ScaleOutShape(LoadTestShape):
    """
    Linear ramp: +100 users every second.
    Stops at one hour (≈ 360 k users) unless you abort earlier.
    """
    def tick(self):
        t = self.get_run_time()
        if t >= 3600:            # hard stop at 1 h
            return None
        users = int(t) * 100
        return (users, 100)      # spawn-rate keeps pace with target
