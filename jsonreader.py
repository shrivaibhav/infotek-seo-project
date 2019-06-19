import json

data = ""

with open("newjson.json", "r+") as f:
    #data = json.load(f)
    data = f.read()
    #data = data[0:]
    print(data)
    #jsondata = json.loads(data)
    # print(jsondata)
"""
jsondata["project management"].extend(["certification training"])
# print(type(jsondata))
with open("newjson.json", "w+") as f2:
    f2.write(json.dumps(jsondata))
"""
"""
with open("newjson.json") as f3:
    data = f3.read()
    print(data)
"""
