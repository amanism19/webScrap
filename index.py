#Python program to scrape website 
#and save quotes from website 
import requests 
from bs4 import BeautifulSoup 
# import csv 

URL = "https://www.lightnovelpub.com/novel/a-maidens-unwanted-heroic-epic-1667/chapter-1" 
r = requests.get(URL) 
# print(r.content)
soup = BeautifulSoup(r.content, 'html5lib') 
print(soup.prettify()) 
quotes=[] # a list to store quotes 

print("hello")
table = soup.find('div', attrs = {'id':'chapter-container'}) 

# for row in table.findAll('div', attrs = {'class':'col-6 col-lg-3 text-center margin-30px-bottom sm-margin-30px-top'}): 
# 	quote = {} 
# 	quote['theme'] = row.h5.text 
# 	quote['url'] = row.a['href'] 
# 	quote['img'] = row.img['src'] 
# 	quote['lines'] = row.img['alt'].split(" #")[0] 
# 	quote['author'] = row.img['alt'].split(" #")[1] 
# 	quotes.append(quote) 
print(table)
# filename = 'inspirational_quotes.csv'
# with open(filename, 'w', newline='') as f: 
# 	w = csv.DictWriter(f,['theme','url','img','lines','author']) 
# 	w.writeheader() 
# 	for quote in quotes: 
# 		w.writerow(quote) 
