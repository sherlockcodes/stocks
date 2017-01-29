import json
from datetime import datetime,timedelta
import os
import argparse
import urlparse
from collections import OrderedDict

import requests
from bs4 import BeautifulSoup

from stock_parser import StockParser
from report import Report
from recommendation import StockRecommendation

quarterly_result_url = 'http://www.moneycontrol.com/mccode/common/results_calender.php?sort=date'

def get_content():
	return requests.get(quarterly_result_url).text

def get_result_table(content):
	soup = BeautifulSoup(content)
	tables = soup.findAll('table')
	result_table = tables[len(tables)-1]
	rows = result_table.findChildren('tr')
	rows.reverse()
	return rows 

def get_upcoming_result(rows,days=7):
	companies = []
	for row in rows[:len(rows)-1]:
		tds = row.findChildren('td')
		if len(tds) == 2:
			name = tds[0].string
			announcement_date = datetime.strptime(tds[1].string,'%d-%b-%Y')
			if announcement_date < datetime.today() or announcement_date > datetime.today() + timedelta(days=days):
				continue
			link_tag = tds[0].find('a')
			if link_tag is not None:
				company_url = link_tag.get('href')
				stock_page = get_company_stock_page(company_url)
				companies.append({name: {"readable_date":tds[1].string, "company_link":company_url, "stock_page":"http://www.moneycontrol.com" + stock_page}})
	return companies

def get_company_stock_page(company_url):
	content = requests.get(company_url).text
	soup = BeautifulSoup(content)
	divs = soup.findAll("dt", { "class" : "home" })
	if len(divs):
		link_tag = divs[0].find('a')
		if link_tag:
			return link_tag.get('href')
	return None

def get_parser():
	parser = argparse.ArgumentParser(description='Stock Recommendations')
	parser.add_argument('-i', help="Sectors which you're interested",required=False)
	parser.add_argument('-e', help="Sectors which you're not interested", required=False)
	parser.add_argument('-min',  nargs='?', const=0, type=int, help='minimum price',required=False)
	parser.add_argument('-max', nargs="?", type=int, const=1000,help='maximum price',required=False)
	parser.add_argument('-f', help="Directory to save result file", required=False)
	parser.add_argument('-r', help="To generate recommendations (1 to enable)", type=int, const=1, nargs="?")
	parser.add_argument('-s', help='To get sector names in stocks',required=False)
	parser.add_argument('-days', help="How many days to consider upcoming results ", type=int, const=7, nargs="?")
	return parser

def display_sector():
	sectors = json.loads(open('sectors.json').read())
	keylist = sorted(sectors.keys(), key=lambda x: int(x))
	ordered_sectors = OrderedDict(((k, sectors[k]) for k in keylist))
	for sector_id,sector_name in ordered_sectors.items():
		print sector_id, '->' ,sector_name

def generate_recommendation(quarterly_record, args):
	interested_sectors = []
	exclude_sectors = []
	min_stock_amount = 1 if (args["min"] == None) else args["min"]
	max_stock_amount = 1000 if (args['max'] == None) else args["max"]
	if 'i' in args and args['i'] and ',' in args['i']:
		interested_sectors = map(int, args['i'].split(','))
	elif 'e' in args and args['e'] and ',' in args['e']:
		exclude_sectors = map(int,args['e'].split(','))
	reco = StockRecommendation(quarterly_record,interested_sectors,exclude_sectors,min_stock_amount,max_stock_amount)
	print 'Generating recommendations from upcoming quarterly results'
	reco.build()
	recommended_stocks = reco.get_recommended_stocks()
	report = Report(recommended_stocks,file_name = 'recommendated_stocks.csv')
	report.generate()
	print 'Recommendation generated.'

def process_stocks(args):
	parser = StockParser()
	content = get_content()
	rows = get_result_table(content)
	print 'Getting upcoming results. It may take a while.'
	if args["days"]:
		upcoming_results = get_upcoming_result(rows,args['days'])
	else:
		upcoming_results = get_upcoming_result(rows)
	quarterly_record = []
	print 'Fetching upcoming stocks data.'
	for stock in upcoming_results:
		for company_name, stock_info in stock.iteritems():
			try:
				if "stock_page" in stock_info and stock_info["stock_page"]:
					stock_data = parser.get_stock_data(stock_info["stock_page"])
					stock_info.update({"company_name":company_name})
					stock_info.update(stock_data)
					quarterly_record.append(stock_info)
			except Exception as e:
				pass
	if len(quarterly_record):
		if 'r' in args and args['r'] is not None:
			generate_recommendation(quarterly_record, args)
		if 'f' in args and args['f']:
			report = Report(quarterly_record,file_name=args['f'])
		else:
			report = Report(quarterly_record,file_name='overall_quarterly_result.csv')
		report.generate()	

def process_command_line():
	parser = get_parser()
	args = vars(parser.parse_args())
	if "s" in args and args["s"] is not None:
		display_sector()
		exit(1)
	process_stocks(args)


if __name__ == "__main__":
    process_command_line()