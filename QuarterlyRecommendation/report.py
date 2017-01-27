import csv
class Report:
	def __init__(self, stock_data, file_path = None):
		self.stock_data = stock_data
		self.report_file_path = file_path
		if self.report_file_path is None:
			self.report_file_path = '/tmp/quarterly_result.csv'
	def generate(self):
		csv_file = csv.writer(open(self.report_file_path,'w'))
		csv_file.writerow(self.stock_data[0].keys())
		for row in self.stock_data:
			csv_file.writerow(row.values())
		print 'quarterly report written at ', self.report_file_path

