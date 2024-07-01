import requests
from bs4 import BeautifulSoup
import json
import sys
import re

d = {
    '2007': "https://www.espncricinfo.com/series/icc-world-twenty20-2007-08-286109/points-table-standings",
    '2009': "https://www.espncricinfo.com/series/icc-world-twenty20-2009-335113/points-table-standings",
    '2010': "https://www.espncricinfo.com/series/icc-world-twenty20-2010-412671/points-table-standings",
    '2012': "https://www.espncricinfo.com/series/icc-world-twenty20-2012-13-531597/points-table-standings",
    '2014': "https://www.espncricinfo.com/series/world-t20-2013-14-628368/points-table-standings",
    '2016': "https://www.espncricinfo.com/series/world-t20-2015-16-901359/points-table-standings",
    '2021': "https://www.espncricinfo.com/series/icc-men-s-t20-world-cup-2021-22-1267897/points-table-standings",
    '2022': "https://www.espncricinfo.com/series/icc-men-s-t20-world-cup-2022-23-1298134/points-table-standings",
    '2024': "https://www.espncricinfo.com/series/icc-men-s-t20-world-cup-2024-1411166/points-table-standings"
}

winners = {
    '2007': "India", '2009': "Pakistan", '2010': "England", '2012': "West Indies", '2014': "Sri Lanka",'2016': "West Indies", '2021': "Australia", '2022': "England",'2024': "India"
}

def get_t20_table(year):
    
    if str(year) in d.keys():
        url = d.get(str(year))

        soup = BeautifulSoup(requests.get(url).text, "html.parser")

        overall_container = soup.find("div", attrs={"class": "ds-w-full ds-bg-fill-content-prime ds-overflow-hidden ds-rounded-xl ds-border ds-border-line"})

        groups = soup.find_all("span", attrs={"class": "ds-text-tight-s ds-font-bold ds-uppercase"})
        groups = [item.get_text() for item in groups]

        tables = overall_container.find_all("table", attrs={"class": "ds-w-full ds-table ds-table-md ds-table-auto ds-w-full"})

        to_return = dict()

        for outer_idx, table in enumerate(tables):

            two_d = []

            headers = table.find("tr")
            headers = [item.get_text() for item in headers.find_all("th")]
            two_d.append(headers)

            rows = table.find_all("tr")

            for row in rows[1::2]:
                # teams = row.find_all("span", attrs={"class": "ds-text-tight-s ds-font-bold ds-uppercase ds-text-left ds-text-typo"})
                # teams = [item.get_text() for item in teams]

                cols = [col for col in row.find_all("td")]
                cols = [item.get_text() for item in cols]
                cols[0] = re.findall(r"[^\d]+", cols[0])[0]
            
            
                two_d.append(cols)

            to_return[groups[outer_idx]] = two_d

            to_return['winner'] = winners.get(str(year))

        return to_return
        
    else:
        print("Year not found!")


if __name__ == "__main__":
    year = sys.argv[1]
    # year = 2022
    # points_table_json = get_points_table(year)
    # print(points_table_json)
    print(json.dumps(get_t20_table(year)))