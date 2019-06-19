
import bs4 as bs
from bs4.element import Comment
import urllib.request
import re
import string
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.stop_words import ENGLISH_STOP_WORDS
#from nltk.stem import WordNetLemmatizer
from heapq import nlargest
import ssl
from time import time
import userAgents

def tag_visible(element):
    if element.parent.name in ['style', 'script', 'head', '[document]']:
        return False
    if isinstance(element, Comment):
        return False
    return True

def text_from_html(body):
    print("in text_from_html")
    soup = bs.BeautifulSoup(body, 'html.parser')
    texts = soup.findAll(text=True)
    visible_texts = filter(tag_visible, texts)
    #print(texts)
    return visible_texts
    #return u" ".join(t.strip() for t in visible_texts)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
ourStopWords = set({"click","view","more","link","forgot","password"})
       

print("imported")
#startTime = time()
def getSiteKeywords(url):
    html=''
    count=0
    while(True):
        try:
            req = urllib.request.Request(url,data=None,headers={'User-Agent': userAgents.getRandomUserAgent()})
            html = urllib.request.urlopen(req, context=ctx).read()
            #html = urllib.request.urlopen(url, context = ctx).read()
            break
        #sauce = urllib.request.urlopen(url).read()
        #soup = bs.BeautifulSoup(sauce,'lxml')
        except Exception as e:
            print(e,url)
            if(count==2):
                return []
            count+=1
    #print(soup.get_text())
    #print(soup)
    #return None
    #tags = ['a','h1','h2','h3','meta','title','p','div']

    #keywords = []

    #for i in tags :
        #keywords += list(soup.find_all(i))
    
    d = dict()
    #lemmatizer=WordNetLemmatizer()
    removeSpcCharPattern=re.compile('[\W_]+')
    #print(type(html))
    #count=0
    for data in text_from_html(html):
        if(len(data)<=2):
            continue
        #print(data,len(data))
        text = data.lower().strip()
        text= removeSpcCharPattern.sub(' ',text)
        text = text.strip()
        text = re.sub(r'\d+', '', text)
        text = re.sub(r"[^\w\s]","",text)

        #text = text.translate(string.maketrans("","", string.punctuation))
        #print(text)
        tokens = word_tokenize(text)
        for i in tokens:
            if not i in ENGLISH_STOP_WORDS | ourStopWords:
                #result = lemmatizer.lemmatize(i)
                result = i
                if(len(result)<=2):
                    continue
                if result not in d:
                    d[result] =  1
                else:
                    d[result] += 1
        #if(count==20):
            #break
        #count+=1
    
    largest50 = nlargest(min(50,len(d)),d, key = d.get)
    return largest50

#print(getSiteKeywords("https://www.itlearn360.com"))
#endTime = time()
#print(endTime - startTime)
"""



from bs4 import BeautifulSoup
from bs4.element import Comment
import urllib.request
import ssl
print("imported")
def tag_visible(element):
    if element.parent.name in ['style', 'script', 'head', '[document]']:
        return False
    if isinstance(element, Comment):
        return False
    return True


def text_from_html(body):
    print("in text_from_html")
    soup = BeautifulSoup(body, 'html.parser')
    texts = soup.findAll(text=True)
    visible_texts = filter(tag_visible, texts)
    #print(texts)
    return u" ".join(t.strip() for t in visible_texts)

url = "https://expired.badssl.com"
#req = urllib.request(url)
#gcontext = ssl.SSLContext()  # Only for gangstars
print("no error")
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
html = urllib.request.urlopen(url, context = ctx).read()

#html = urllib.urlopen(req, context=gcontext).read()
print(text_from_html(html))

"""
