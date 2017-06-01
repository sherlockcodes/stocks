import csv
class Report:
	def __init__(self, stock_data, file_path = None, file_name =None):
		self.stock_data = stock_data
		self.report_file_path = file_path
		if self.report_file_path is None:
			self.report_file_path = '/home/hari/Desktop/'
		self.file_name = file_name
		if self.file_name is None:
			self.file_name = 'intraday_reco.csv'

	def generate(self):
		csv_file = csv.writer(open(self.report_file_path + self.file_name,'w'))
		columns = ['sector', 'company_name','current_price', 'open_price', 'prev_close', '52_week_high','52_week_low','today_low', 'today_high', 'buy_qty', 'sell_qty', 'recommended_to_sell', 'recommended_to_buy', 'bullish']
		csv_file.writerow(columns)
		for row in self.stock_data:
			csv_file.writerow(map( lambda x: row.get( x, "" ), columns))
		print 'quarterly report written at ', self.report_file_path + self.file_name

