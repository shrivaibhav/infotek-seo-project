from flask import Flask, render_template, request, redirect, url_for,jsonify
import webscrap1
import json
import brokenLinks.brokenlink as brokenlink
from time import time
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('UrlIntake.html')


@app.route('/getSuggestions',methods = ['POST','GET'])
def suggestion():
    print('request recieved')
    #print(request.data)
    data = json.loads(str(request.data)[2:-1])
    #category = data["category"]
    siteurl = data["siteurl"]
    print(data,type(data))
    #print(json.loads(request.data),type(request.data))
    #print("*******",type(request))
    #return "welcome"
    
    results = {}
    count = 1
    for i in siteurl:
        results[str(count)] = webscrap1.getSiteKeywords(i)
        count+=1
    results["length"] = len(results)
    print(json.dumps(results))
    print(jsonify(results),type(jsonify(results)))
    response = jsonify(results)
    return response

    
    '''
    if request.method == 'POST' :
        userUrl = request.form['userUrl']
        results = webscrap1.getSiteKeywords(userUrl)
        return render_template('UrlOutput.html',results = results)
    return render_template('UrlIntake.html')
    '''

@app.route('/getBrokenLinks',methods = ['POST','GET'])
def brokenLinks():
    print('request recieved')
    start = time()
    #print(request.data)
    data = json.loads(str(request.data)[2:-1])
    #category = data["category"]
    siteurl = data["siteurl"]
    #print(data,type(data))
    #print(json.loads(request.data),type(request.data))
    #print("*******",type(request))
    #return "welcome"
    
    results = {}
    for i in siteurl:
        results = brokenlink.getBrokenLinks(i)
    print(time()-start)
    print(json.dumps(results))
    print(jsonify(results),type(jsonify(results)))
    response = jsonify(results)
    return response
    
if __name__ == "__main__":
    app.run(debug = True)



"""
from flask import json

@app.route('/site',methods=['POST'])
def summary():
    data = make_summary()
    response = app.response_class(
        response=json.dumps(data),
        status=200,
        mimetype='application/json'
    )
    return response
"""

