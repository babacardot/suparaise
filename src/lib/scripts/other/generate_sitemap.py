import os
from datetime import datetime
from urllib.parse import urljoin
import xml.etree.ElementTree as ET
import logging
from typing import Dict, List

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SitemapGenerator:
    def __init__(self) -> None:
        self.base_url = "https://suparaise.com"
        self.src_dir = "src/app"  # Directory containing Next.js pages
        self.output_dir = "public"
        
        # Priority and change frequency mappings
        self.route_config: Dict[str, Dict] = {
            "": {  # Homepage
                "priority": "1.0",
                "changefreq": "daily"
            },
            "about": {
                "priority": "0.7",
                "changefreq": "monthly"
            },
            "login": {
                "priority": "0.6",
                "changefreq": "monthly"
            },
            "signup": {
                "priority": "0.6",
                "changefreq": "monthly"
            },
            "forgot-password": {
                "priority": "0.5",
                "changefreq": "monthly"
            },
            "terms": {
                "priority": "0.5",
                "changefreq": "monthly"
            },
            "privacy": {
                "priority": "0.5",
                "changefreq": "monthly"
            },
            "default": {
                "priority": "0.5",
                "changefreq": "weekly"
            }
        }

        # Routes to exclude from sitemap
        self.exclude_routes = [
            'api/',
            'callback',
            'dashboard',
            'verify',
            'reset-password',
        ]

    def clean_route(self, route: str) -> str:
        """Clean a route path."""
        # Handle (group) directory structure
        if '(' in route:
            parts = route.split('/')
            cleaned_parts = []
            for part in parts:
                if '(' in part or ')' in part:
                    continue
                cleaned_parts.append(part)
            route = '/'.join(cleaned_parts)

        # Clean up the route
        if route.endswith('/page'):
            route = route[:-5]  # Remove '/page'
        elif route.endswith('page'):
            route = route[:-4]  # Remove 'page'
            
        # Handle index files
        if route.endswith('/index'):
            route = route[:-6]  # Remove '/index'
        elif route == 'index':
            route = ''  # Homepage
        
        # Clean up any double slashes
        while '//' in route:
            route = route.replace('//', '/')
        
        # Remove leading/trailing slashes
        return route.strip('/')

    def get_route_paths(self) -> List[str]:
        """Extract routes from page.tsx files."""
        routes = []
        
        for root, _, files in os.walk(self.src_dir):
            for file in files:
                if file == 'page.tsx':
                    file_path = os.path.join(root, file)
                    # Remove src directory and file extension
                    route = os.path.splitext(os.path.relpath(file_path, self.src_dir))[0]
                    
                    # Convert path separators to URL format
                    route = route.replace(os.path.sep, '/')
                    
                    # Skip dynamic routes
                    if '[' in route or ']' in route:
                        continue
                        
                    # Clean the route
                    route = self.clean_route(route)

                    # Skip excluded routes
                    if any(route.startswith(excluded) for excluded in self.exclude_routes):
                        continue
                    
                    # Add route if it's not already added
                    if route not in routes:
                        routes.append(route)
        
        # Make sure homepage is included
        if '' not in routes:
            routes.append('')
            
        return sorted(routes)

    def get_route_config(self, route: str) -> Dict:
        """Get priority and change frequency for a route."""
        # Empty route is homepage
        if route == '':
            return self.route_config[""]
            
        # Try exact match first
        if route in self.route_config:
            return self.route_config[route]
            
        # Try prefix match
        for key, config in self.route_config.items():
            if key and route.startswith(key):
                return config
                
        return self.route_config["default"]

    def generate_sitemap(self) -> None:
        """Generate the sitemap XML file."""
        try:
            # Create urlset element with namespace
            urlset = ET.Element("urlset")
            urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")

            # Get all routes
            routes = self.get_route_paths()
            logger.info(f"Found {len(routes)} routes")

            # Add each route to sitemap
            for route in routes:
                url = ET.SubElement(urlset, "url")
                
                # Location
                loc = ET.SubElement(url, "loc")
                full_url = urljoin(self.base_url, route)
                loc.text = full_url

                # Last modified
                lastmod = ET.SubElement(url, "lastmod")
                lastmod.text = datetime.now().strftime("%Y-%m-%d")

                # Get route configuration
                config = self.get_route_config(route)
                
                # Change frequency
                changefreq = ET.SubElement(url, "changefreq")
                changefreq.text = config["changefreq"]
                
                # Priority
                priority = ET.SubElement(url, "priority")
                priority.text = config["priority"]

            # Create output directory if it doesn't exist
            os.makedirs(self.output_dir, exist_ok=True)

            # Convert to string with proper formatting
            rough_string = ET.tostring(urlset, 'utf-8')
            from xml.dom import minidom
            reparsed = minidom.parseString(rough_string)
            formatted_xml = reparsed.toprettyxml(indent="  ")
            
            # Remove empty lines
            formatted_xml = '\n'.join([line for line in formatted_xml.split('\n') if line.strip()])

            # Write the sitemap file
            output_path = os.path.join(self.output_dir, "sitemap.xml")
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(formatted_xml)
            
            logger.info(f"Sitemap generated successfully at {output_path}")

        except Exception as e:
            logger.error(f"Error generating sitemap: {str(e)}")
            raise

if __name__ == "__main__":
    generator = SitemapGenerator()
    generator.generate_sitemap()