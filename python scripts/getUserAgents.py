import requests as req
from bs4 import BeautifulSoup
import time


def save(br,ua):
    try:
        file = 'userAgents.py'
        with open(file,'a+') as f:
            f.write('\"'+ua+'\"' +',')
    except:
        print("error in file")
        #exit()


def getUa(br):
    url = 'http://www.useragentstring.com/pages/useragentstring.php?name='+br
    r = req.get(url)

    if r.status_code == 200:
	    soup = BeautifulSoup(r.content,'html.parser')
    else:
	    soup = False
    if soup:
        div = soup.find('div',{'id':'liste'})
        lnk = div.findAll('a')
        for i in lnk:
            try:
        	    save(br,i.text)
            except:
                print ('no ua')
    else:
            print ('No soup for '+br)



lst = ['Firefox','Internet+Explorer','Opera','Safari','Chrome','Edge','Android+Webkit+Browser']

for i in lst:
    getUa(i)
time.sleep(20)
