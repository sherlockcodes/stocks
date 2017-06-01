import requests
from bs4 import BeautifulSoup

class IndexParser():
	def __init__(self):
		self.soup = None
		self.base_url = "http://www.moneycontrol.com/indian-indices/"
		self.index_data = {}

	def get_index_data(self, stock_url):
		content = requests.get(self.base_url + stock_url ).text
		self.soup = BeautifulSoup(content)
		for method_name in dir(self):
			if method_name.startswith("fetch"):
				getattr(self, method_name)()
		return self.index_data


	# def fetch_today_low(self):
	# 	self.index_data["today_low"] = float(self.soup.find("span",{"id":"b_low_sh"}).string)

	# def fetch_today_high(self):
	# 	self.index_data["today_high"] = float(self.soup.find("span",{"id":"n_high_sh"}).string)

	# def fetch_52_week_high(self):
	# 	self.index_data["52_week_high"] = float(self.soup.find("span",{"id":"b_52high"}).string)

	# def fetch_52_week_low(self):
	# 	self.index_data["52_week_low"] = float(self.soup.find("span",{"id":"b_52low"}).string)

	def fetch_prev_close(self): 
		prev_close =  self.soup.findAll("td",{"class":"bggry02 br01"})[1].text.replace("PREV CLOSE:","").replace(",","")
		self.index_data["prev_close"] = float(prev_close)

	def fetch_open_price(self): 
		open_price =  self.soup.findAll("td",{"class":"bggry02 br01"})[0].text.replace("OPEN:","").replace(",","")
		self.index_data["open_price"] = float(open_price)





