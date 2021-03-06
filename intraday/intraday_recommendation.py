import json
import os
import argparse
import copy

from stock_parser import StockParser
from index_parser import IndexParser
from report import Report

def get_watchlist_stocks():
	try:
		content = json.loads(open('./data/nifty50.json').read())
		return content
	except Exception as e:
		print 'problem getting watchlist stocks', e
		return {}

def get_indices():
	try:
		content = json.loads(open('./data/nifty_indices.json').read())
		return content
	except Exception as e:
		print 'problem getting watchlist stocks', e
		return {}

def is_stock_bullish(stock_data):
	return stock_data["open_price"] > stock_data["prev_close"] and stock_data["buy_qty"] > stock_data["sell_qty"] and stock_data["recommended_to_buy"] > 60

def update_stock_indicators(stock):
	total_holding = stock["buy_qty"] + stock["sell_qty"]
	buy_percentage = (stock["buy_qty"] * 100) / total_holding
	sell_percentage = (stock["sell_qty"] * 100) / total_holding
	stock["buy_percentage"] = buy_percentage
	stock["sell_percentage"] = sell_percentage
	change = stock["prev_close"] - stock["current_price"]
	percentage_change = -(change / float(stock["prev_close"]) * 100)
	stock["change"] = percentage_change
	stock["gap"] = "up" if stock["prev_close"] > stock["open_price"] else "down"
	is_bullish = is_stock_bullish(stock)
	stock["bullish"] = is_bullish
	return stock


def generate_intraday_reco():
	stocks = get_watchlist_stocks()
	all_stock_data = []
	parser = StockParser()
	for stock_name, stock_url in stocks.iteritems():
		stock_data = {}
		stock_data = copy.deepcopy(parser.get_stock_data(stock_url))
		stock_data = update_stock_indicators(stock_data)		
		stock_data.update({"company_name":stock_name})
		all_stock_data.append(stock_data)


	report = Report(all_stock_data)
	report.generate()

def is_index_bullish(index_data):
	return index_data["open_price"] > index_data["prev_close"]

def check_nifty_indices():
	indices = get_indices()
	index_parser = IndexParser()
	all_index_data = []
	for sector, sector_url in indices.iteritems():
		index_data = {}
		index_data = copy.deepcopy(index_parser.get_index_data(sector_url))
		is_bullish = is_index_bullish(index_data)
		index_data.update({"sector":sector,"is_bullish":is_bullish})		
		all_index_data.append(index_data)
	print all_index_data

def process():
	check_nifty_indices()
	generate_intraday_reco()

if __name__ == "__main__":
	process()
