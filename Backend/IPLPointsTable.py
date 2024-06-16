import requests
from bs4 import BeautifulSoup
import json
import sys

d = {
    '2023': "https://www.espncricinfo.com/series/indian-premier-league-2023-1345038/points-table-standings",
    '2024': "https://www.espncricinfo.com/series/indian-premier-league-2024-1410320/points-table-standings",
    '2022': "https://www.espncricinfo.com/series/indian-premier-league-2022-1298423/points-table-standings",
    '2021': "https://www.espncricinfo.com/series/ipl-2021-1249214/points-table-standings",
    '2020': "https://www.espncricinfo.com/series/ipl-2020-21-1210595/points-table-standings",
    '2019': "https://www.espncricinfo.com/series/ipl-2019-1165643/points-table-standings",
    '2018': "https://www.espncricinfo.com/series/ipl-2018-1131611/points-table-standings",
    '2017': "https://www.espncricinfo.com/series/ipl-2017-1078425/points-table-standings",
    '2016': "https://www.espncricinfo.com/series/ipl-2016-968923/points-table-standings",
    '2015': "https://www.espncricinfo.com/series/pepsi-indian-premier-league-2015-791129/points-table-standings",
    '2014': "https://www.espncricinfo.com/series/pepsi-indian-premier-league-2014-695871/points-table-standings",
    '2013': "https://www.espncricinfo.com/series/indian-premier-league-2013-586733/points-table-standings",
    '2012': "https://www.espncricinfo.com/series/indian-premier-league-2012-520932/points-table-standings",
    '2011': "https://www.espncricinfo.com/series/indian-premier-league-2011-466304/points-table-standings",
    '2010': "https://www.espncricinfo.com/series/indian-premier-league-2009-10-418064/points-table-standings",
    '2009': "https://www.espncricinfo.com/series/indian-premier-league-2009-374163/points-table-standings",
    '2008': "https://www.espncricinfo.com/series/indian-premier-league-2007-08-313494/points-table-standings"
}

p = {
    '2008': "Rajasthan Royals", '2009': "Deccan Chargers", '2010': "Chennai Super Kings",
    '2011': "Chennai Super Kings", '2012': "Kolkata Knight Riders", '2013': "Mumbai Indians",
    '2014': "Kolkata Knight Riders", '2015': "Mumbai Indians", '2016': "Sunrisers Hyderabad",
    '2017': "Mumbai Indians", '2018': "Chennai Super Kings", '2019': "Mumbai Indians",
    '2020': "Mumbai Indians", "2021": "Chennai Super Kings", '2022': "Gujarat Titans", '2023': "Chennai Super Kings",
    '2024': "Kolkata Knight Riders"
}

def get_points_table(year):
    response_data = {}
    year = str(year)
    if year in d:
        url = d[year]
        response = requests.get(url)

        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            rows = soup.find_all('tr', class_='ds-text-tight-s ds-text-typo-mid2')

            points_table = []
            for idx, row in enumerate(rows):
                cols = row.find_all('td')
                if len(cols) > 0:
                    team_name = cols[0].text.strip()[1:]
                    rank = cols[0].text.strip()[0]
                    played = cols[1].text.strip()
                    wins = cols[2].text.strip()
                    lost = cols[3].text.strip()
                    nr = cols[5].text.strip()
                    points = cols[6].text.strip()
                    nrr = cols[7].text.strip()
                    points_table.append({
                        "rank": rank, "team_name": team_name, "played": played, 
                        "wins": wins, "lost": lost, "nr": nr, "nrr": nrr, "points": points
                    })
                    
            response_data["points_table"] = points_table
            response_data["winner"] = p.get(year, "Unknown")
        else: 
            response_data["error"] = "Failed to retrieve data from the URL."
    else:
        response_data["error"] = "Year not found in the dictionary."

    return json.dumps(response_data, indent=4)

if __name__ == "__main__":
    year = sys.argv[1]
    points_table_json = get_points_table(year)
    print(points_table_json)
