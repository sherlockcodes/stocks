import json

class StockRecommendation:
	def __init__(self, quarterly_result, included_sectors=[], excluded_sectors=[], min_amount=1, max_amount=1000):
		self.quarterly_result = quarterly_result
		self.included_sectors = included_sectors
		self.excluded_sectors = excluded_sectors
		self.min_amount = min_amount
		self.max_amount = max_amount
		self.recommendated_stocks = []
		self.sectors = {}

	def build(self):
		self.__load_sectors()
		self.included_sectors = map(self.__get_sector_name_by_id, self.included_sectors)
		self.excluded_sectors = map(self.__get_sector_name_by_id, self.excluded_sectors)
		self.__filter_out()

	def get_recommended_stocks(self):
		return self.recommendated_stocks

	def __filter_out(self):
		for stock in self.quarterly_result:
			if "sector" in stock:
				if len(self.included_sectors) and stock["sector"] not in self.included_sectors:
					continue
				elif len(self.excluded_sectors) and stock["sector"] in self.excluded_sectors:
					continue
				if not self.__is_price_range_match(stock):
					continue
				if not self.__has_demand(stock):
					continue
				if not self.__is_stock_doing_well(stock):
					continue
				self.recommendated_stocks.append(stock)


	# this method will check whether stock is doing well or not. 
	# if open price is greater than previous close and current_price is greater than open_price,
	# it means that stock doing well.

	def __is_stock_doing_well(self, stock):
		if "prev_close" in stock and "open_price" in stock and "current_price" in stock:
			prev_close = stock["prev_close"]
			open_price = stock["open_price"]
			current_price = stock["current_price"]
			return open_price >= prev_close and current_price > open_price
		return False

	# this method will check whether has demand or not.
	# if buy quantity is greater than sell quantity, it means that stock have some demand.

	def __has_demand(self, stock):
		if "buy_qty" in stock and "sell_qty" in stock:
			total_holding = stock["buy_qty"] + stock["sell_qty"]
			buy_percentage = (stock["buy_qty"] * 100) / total_holding
			sell_percentage = (stock["sell_qty"] * 100) / total_holding
			return (buy_percentage - 5) > sell_percentage 
		return False

	def __load_sectors(self):
		self.sectors = json.loads(open('sectors.json').read())

	def __get_sector_name_by_id(self, sector_id):
		return self.sectors[str(sector_id)]

	# method to check stock current price matches user preference
	
	def __is_price_range_match(self, stock):
		if "current_price" in stock:
			current_price = stock["current_price"]
		return current_price >= self.min_amount and current_price <= self.max_amount