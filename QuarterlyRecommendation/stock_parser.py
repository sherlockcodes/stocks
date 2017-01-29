import requests
from bs4 import BeautifulSoup

class StockParser():
	def __init__(self):
		self.soup = None
		self.stock_info = {}

	def get_stock_data(self, stock_url):
		print 'stock_url', stock_url
		content = requests.get(stock_url).text
		print 'done'
		self.soup = BeautifulSoup(content)
		for method_name in dir(self):
			if method_name.startswith("fetch"):
				getattr(self, method_name)()
		return self.stock_info

	def fetch_sector(self):
		self.stock_info["sector"] = self.soup.findAll('div',{"class":"FL gry10"})[0].findAll('a')[0].get('title')

	def fetch_today_low(self):
		self.stock_info["today_low"] = float(self.soup.find("span",{"id":"b_low_sh"}).string)

	def fetch_today_high(self):
		self.stock_info["today_high"] = float(self.soup.find("span",{"id":"n_high_sh"}).string)

	def fetch_52_week_high(self):
		self.stock_info["52_week_high"] = float(self.soup.find("span",{"id":"b_52high"}).string)

	def fetch_52_week_low(self):
		self.stock_info["52_week_low"] = float(self.soup.find("span",{"id":"b_52low"}).string)

	def fetch_today_high(self):
		self.stock_info["today_high"] = float(self.soup.find("span",{"id":"b_high_sh"}).string)

	def fetch_today_low(self):
		self.stock_info["today_low"] = float(self.soup.find("span",{"id":"b_low_sh"}).string)

	def fetch_buy_qty(self):
		buy_qty = self.soup.find("p",{"id":"b_total_buy_qty"}).string
		if "K" in buy_qty:
			buy_qty = int(''.join(x for x in buy_qty if x.isdigit())) * 1000
		else:
			buy_qty = int(''.join(x for x in buy_qty if x.isdigit()))
		self.stock_info["buy_qty"] = buy_qty

	def fetch_sell_qty(self):
		sell_qty = self.soup.find("p",{"id":"b_total_sell_qty"}).string
		if "K" in sell_qty:
			sell_qty = int(''.join(x for x in sell_qty if x.isdigit())) * 1000
		else:
			sell_qty = int(''.join(x for x in sell_qty if x.isdigit())) 
		self.stock_info["sell_qty"] = sell_qty

	def fetch_prev_close(self): 
		self.stock_info["prev_close"] = float(self.soup.find("div",{"id":"b_prevclose"}).string)

	def fetch_open_price(self): 
		self.stock_info["open_price"] = float(self.soup.find("div",{"id":"b_open"}).string)

	def fetch_recommended_score(self):
		buy_percentage_tag = self.soup.find("span",{"class":"pl_bar brdwr"})
		if buy_percentage_tag:
			buy_percentage = buy_percentage_tag.get('style')
			buy_percentage = ''.join(x for x in buy_percentage if x.isdigit())
			self.stock_info["recommended_to_buy"] = int(buy_percentage)
		sell_percentage_tag = self.soup.find("span",{"class":"pl_bar brdwr rd"})
		if sell_percentage_tag:
			sell_percentage = sell_percentage_tag.get("style")
			sell_percentage = ''.join(x for x in sell_percentage if x.isdigit())
			self.stock_info["recommended_to_sell"] = int(sell_percentage)

	def fetch_current_price(self):
		current_price_tag = self.soup.find("span",{"id":"Bse_Prc_tick"})
		if current_price_tag:
			self.stock_info["current_price"] = float(current_price_tag.string)



