import json
from datetime import datetime,timedelta
import urlparse
import requests
from bs4 import BeautifulSoup
from stock_parser import StockParser
from report import Report

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

def get_upcoming_result(result):
	companies = []
	for row in rows[:len(rows)-1]:
		tds = row.findChildren('td')
		if len(tds) == 2:
			name = tds[0].string
			announcement_date = datetime.strptime(tds[1].string,'%d-%b-%Y')
			if announcement_date < datetime.today() or announcement_date > datetime.today() + timedelta(days=3):
				continue
			link_tag = tds[0].find('a')
			if link_tag is not None:
				company_url = link_tag.get('href')
				stock_page = getCompany_stock_page(company_url)
				companies.append({name: {"readable_date":tds[1].string, "date":announcement_date, "company_link":company_url, "stock_page":"http://www.moneycontrol.com" + stock_page}})
	return companies

def getCompany_stock_page(company_url):
	content = requests.get(company_url).text
	soup = BeautifulSoup(content)
	divs = soup.findAll("dt", { "class" : "home" })
	if len(divs):
		link_tag = divs[0].find('a')
		if link_tag:
			return link_tag.get('href')
	return None

parser = StockParser()
content = get_content()
rows = get_result_table(content)
upcoming_results = get_upcoming_result(rows)
quarterly_record = []
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
	report = Report(quarterly_record)
	report.generate()


