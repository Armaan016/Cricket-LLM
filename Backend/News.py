import requests
from bs4 import BeautifulSoup
import json

def main():
    url = 'https://www.espncricinfo.com/cricket-news'
    
    response = requests.get(url)
    
    soup = BeautifulSoup(response.content, 'html.parser')
    
    news_div = soup.find('div', class_='ds-p-0')
    if not news_div:
        print("No news div found. Double-check your HTML structure.")
        return
    
    news_containers = news_div.find_all('div', class_='ds-border-b ds-border-line ds-p-4')
    news_data = []
     
    for news_container in news_containers:
        news_item = {}
        
        link_element = news_container.find('a')
        news_item['link'] = link_element['href'] 
        
        headline_element = news_container.find('h2', class_='ds-text-title-s ds-font-bold ds-text-typo')
        news_item['headline'] = headline_element.text.strip() 
        
        summary_element = news_container.find('p', class_='ds-text-compact-s ds-text-typo-mid2 ds-mt-1')
        summary_text = summary_element.find('div').text.strip() 
        news_item['summary'] = summary_text
        
        time_element = news_container.find('span', class_='ds-text-compact-xs')
        time_text = time_element.text.strip() 
        news_item['time'] = time_text
        
        # Fix for the image URL
        image_element = news_container.find('img', class_='hover:ds-scale-110 hover:ds-transition-transform hover:ds-duration-500 hover:ds-ease-in-out ds-rounded-lg')
        if image_element:
            news_item['image_url'] = image_element['src'] if 'src' in image_element.attrs else "No image URL"
        else:
            news_item['image_url'] = "No image available"
        
        news_data.append(news_item)
    
    print(json.dumps(news_data, indent=4)) 
    return

if __name__ == '__main__':
    main()
