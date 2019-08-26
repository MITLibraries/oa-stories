import csv
import json
import xlrd
from pprint import pprint

datafile = xlrd.open_workbook('data/original-oacomments_structured_summary.xlsx')
sheet = datafile.sheet_by_index(0)
output_file = 'data/comments.txt'

def get_data_array(sheet):
	RESULTS = []
	for row in range(1, sheet.nrows):
		if str(sheet.cell_value(row, 5)) != 'N':
			kind = sheet.cell_value(row, 0)
			country = sheet.cell_value(row, 6)
			comment = sheet.cell_value(row, 7)
			article = sheet.cell_value(row, 8)
			RESULTS.append([country, kind, article, comment])
	return RESULTS

def convert_countries(data, col_num):
	with open('static/countries.json', 'rb') as data_file:
		countries = json.load(data_file)
		for d in data:
			datum = d[col_num]
			for country in countries:
				try:
					if datum in country['altSpellings']:
						d[col_num] = str(country['cca3'])
				except:
					pass

				if datum == country['name']:
					d[col_num] = str(country['cca3'])
	return data

def get_data_array_from_csv(csv_file):
	with open(csv_file, 'r') as file:
		reader = csv.reader(file, delimiter=',')
		data = []
		numRows = 0

		for row in reader:
			numRows += 1
		file.seek(0)

		for i in range(numRows):
			data_row = next(reader)
			data.append(data_row)

	return data

def create_download_json(download_data):
	"""Takes input OA download data list and creates a JSON object with download data, to be filled in with comment data later.
	"""
	RESULTS = {}
	for d in range(1, len(download_data)):
		country = download_data[d][0]
		RESULTS[country] = {'downloads':download_data[d][1], 'num_comments':0}
	return RESULTS

def add_to_json(json_data, list_data):
	for row in list_data:
		country = row[0]
		if country in json_data:
			if 'comments' in json_data[country]:
				json_data[country]['kind'].append(row[1])
				json_data[country]['comments'].append(row[3])
				json_data[country]['num_comments'] += 1
			else:
				json_data[country]['kind'] = [row[1]]
				json_data[country]['article'] = row[2]
				json_data[country]['comments'] = [row[3]]
				json_data[country]['num_comments'] = 1
	return json_data

def write_to_json(content, file):
	"""Writes content to a json file.

	Args:
		content (dict): Content to be written to file.
		file (string): Path to file to be written, including desired name of file (with extension).
	"""
	with open(file, 'w') as json_file:
		json.dump(content, json_file, indent=4)

if __name__ == '__main__':
	comment_data = get_data_array(sheet)
	new_comment_data = convert_countries(comment_data, 0)

	download_data = get_data_array_from_csv('data/OA_Stats_Map.csv')
	download_data = convert_countries(download_data, 0)
	download_data = create_download_json(download_data)

	json_data = add_to_json(download_data, new_comment_data)
	write_to_json(json_data, 'static/comments.json')
