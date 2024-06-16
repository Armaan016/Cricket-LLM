import requests
from bs4 import BeautifulSoup
import pandas as pd
import json
import sys

# Load the JSON file with player data
with open(r'C:\Users\raufu\Desktop\Cricket LLM\cricket\src\player_profiles.json', 'r') as f:
    player_data = json.load(f)

player = sys.argv[1]
# player = 'Jasprit Bumrah'
player = player.lower()

def scrape_player_profile(player_name, url, image_url):
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to retrieve the URL: {response.status_code}")
        return None

    soup = BeautifulSoup(response.content, 'html.parser')
    
    player_details = {"Name": player_name}  

    profile_container = soup.find('div', class_='ds-grid lg:ds-grid-cols-3 ds-grid-cols-2 ds-gap-4 ds-mb-8')
    
    if profile_container:
        detail_divs = profile_container.find_all('div', class_='ds-col-span-2 lg:ds-col-span-1')
        detail_divs += profile_container.find_all('div')
        
        for div in detail_divs:
            key_element = div.find('p', class_='ds-text-tight-m ds-font-regular ds-uppercase ds-text-typo-mid3')
            value_element = div.find('span', class_='ds-text-title-s ds-font-bold ds-text-typo')
            
            if key_element and value_element:
                key = key_element.get_text(strip=True).strip(":")  
                value = value_element.get_text(strip=True)
                player_details[key] = value

    stats_container = soup.find('div', class_='ds-p-0')
    
    if stats_container:
        tables = soup.find_all('table')
        
        stats_keys = ["Batting_Stats", "Bowling_Stats", "Recent_Matches"]
        
        for i, table in enumerate(tables):
            if table:
                headers = [header.get_text(strip=True) for header in table.find_all('th')]
                rows = []
                
                for row in table.find_all('tr')[1:]:  
                    columns = row.find_all('td')
                    row_data = [column.get_text(strip=True) for column in columns]
                    rows.append(row_data)

                df = pd.DataFrame(rows, columns=headers)
                stats_dict = df.to_dict(orient='list')
                
                if i < len(stats_keys):
                    player_details[stats_keys[i]] = stats_dict
                else:
                    player_details[f"Stats_{i+1}"] = stats_dict
            else:
                print("Stats table not found")
    else:
        print("Stats container not found")
    
    player_details['image_url'] = image_url
    
    return player_details

def main():
    all_player_details = []

    if player in player_data:
        url, image_url = player_data[player]
        player_details = scrape_player_profile(player, url, image_url)
        
        if player_details:
            all_player_details.append(player_details)
            # print(f"Profile for {player} scraped successfully.")
        else:
            print(f"Failed to scrape profile for {player}.")
    else:
        print(f"Player not found: {player}")

    print(json.dumps(player_details))
    
if __name__ == "__main__":
    main()
