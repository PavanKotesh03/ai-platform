import traceback
try:
    from app.main import app
    print("OK")
    with open("trace.txt", "w") as f:
        f.write("OK")
except BaseException as e:
    with open("trace.txt", "w") as f:
        traceback.print_exc(file=f)
