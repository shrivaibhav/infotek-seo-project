import bs4 as bs
import urllib.request
import ssl
import userAgents
#from time import time


ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

#url = "http://www.seoprofound.com"

def isBrokenLink(url):
    try:
        req = urllib.request.Request(url,data=None,headers={'User-Agent': userAgents.getRandomUserAgent()})
        req.get_method = lambda : 'HEAD'
        #print(req.get_method)
        resp = urllib.request.urlopen(req, context=ctx).status
        return resp
    except Exception as e:
        #print(url,e,sep='~~~')
        #print(str(e)[11:14])
        try:
            return int(str(e)[11:14])
        except:
            return 400
#start=""    
def getBrokenLinks(url):
    #global start
    num_total_links = 0
    num_broken_links = 0
    num_active_links = 0
    num_redirect_links = 0
    broken_links = []
    try:
        req = urllib.request.Request(url,data=None,headers={'User-Agent': userAgents.getRandomUserAgent()})
        html = urllib.request.urlopen(req, context=ctx).read()
        soup = bs.BeautifulSoup(html, 'html.parser')
        anchors = soup.find_all("a")
        #start = time()
        for anchor in anchors:
            try:
                i = anchor['href']
            except:
                continue
            u = i
            if(u[0]=='#' or u[:7] == 'mailto:' or u[:4]=='tel:'):
                continue
            elif(u[0]=='/'):
                u = url+i
            response = isBrokenLink(u)
            #print("============",response,"========",type(response))
            #print(u,response)
            if(response==999 or response<300):
                num_active_links+=1
            elif(300<=response<400):
                num_redirect_links+=1
            else:
                broken_links.append(u)
            #print(u,response)
            num_total_links+=1
    except Exception as e:
        print(url,e)
        try:
            response = int(str(e)[11:14])
        except:
            response = 400
        if(response==999 or response<300):
            num_active_links+=1
        elif(300<=response<400):
            num_redirect_links+=1
        else:
            broken_links.append(url)
        #req = urllib.request.Request(url,data=None,headers={'User-Agent': userAgents.getRandomUserAgent()})
        #html = urllib.request.urlopen(req, context=ctx).status
        #print(e,html)
    num_broken_links = len(broken_links)
    d = dict()
    d["broken_links"] = broken_links
    d["num_total_links"] = num_total_links
    d["num_broken_links"] = num_broken_links
    d["num_active_links"] = num_active_links
    d["num_redirect_links"] = num_redirect_links

    return d
    
#print(isBrokenLink('https://www.instagram.com/tcsglobal/'))
