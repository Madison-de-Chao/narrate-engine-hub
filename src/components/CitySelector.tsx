import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// 擴充城市數據庫 - 按地區分類
export const CITY_DATABASE: Record<string, { 
  longitude: number; 
  tzOffset: number; 
  label: string;
  region: string;
  country: string;
}> = {
  // 台灣
  "台北": { longitude: 121.5654, tzOffset: 480, label: "台北", region: "台灣", country: "TW" },
  "高雄": { longitude: 120.3014, tzOffset: 480, label: "高雄", region: "台灣", country: "TW" },
  "台中": { longitude: 120.6736, tzOffset: 480, label: "台中", region: "台灣", country: "TW" },
  "台南": { longitude: 120.2270, tzOffset: 480, label: "台南", region: "台灣", country: "TW" },
  "新竹": { longitude: 120.9647, tzOffset: 480, label: "新竹", region: "台灣", country: "TW" },
  "桃園": { longitude: 121.3010, tzOffset: 480, label: "桃園", region: "台灣", country: "TW" },
  "花蓮": { longitude: 121.6014, tzOffset: 480, label: "花蓮", region: "台灣", country: "TW" },
  
  // 中國大陸
  "北京": { longitude: 116.4074, tzOffset: 480, label: "北京", region: "中國", country: "CN" },
  "上海": { longitude: 121.4737, tzOffset: 480, label: "上海", region: "中國", country: "CN" },
  "廣州": { longitude: 113.2644, tzOffset: 480, label: "廣州", region: "中國", country: "CN" },
  "深圳": { longitude: 114.0579, tzOffset: 480, label: "深圳", region: "中國", country: "CN" },
  "成都": { longitude: 104.0657, tzOffset: 480, label: "成都", region: "中國", country: "CN" },
  "重慶": { longitude: 106.5516, tzOffset: 480, label: "重慶", region: "中國", country: "CN" },
  "杭州": { longitude: 120.1551, tzOffset: 480, label: "杭州", region: "中國", country: "CN" },
  "南京": { longitude: 118.7969, tzOffset: 480, label: "南京", region: "中國", country: "CN" },
  "武漢": { longitude: 114.3054, tzOffset: 480, label: "武漢", region: "中國", country: "CN" },
  "西安": { longitude: 108.9402, tzOffset: 480, label: "西安", region: "中國", country: "CN" },
  "蘇州": { longitude: 120.5853, tzOffset: 480, label: "蘇州", region: "中國", country: "CN" },
  "天津": { longitude: 117.1907, tzOffset: 480, label: "天津", region: "中國", country: "CN" },
  "長沙": { longitude: 112.9388, tzOffset: 480, label: "長沙", region: "中國", country: "CN" },
  "青島": { longitude: 120.3826, tzOffset: 480, label: "青島", region: "中國", country: "CN" },
  "大連": { longitude: 121.6147, tzOffset: 480, label: "大連", region: "中國", country: "CN" },
  "廈門": { longitude: 118.0894, tzOffset: 480, label: "廈門", region: "中國", country: "CN" },
  "昆明": { longitude: 102.8329, tzOffset: 480, label: "昆明", region: "中國", country: "CN" },
  "哈爾濱": { longitude: 126.5348, tzOffset: 480, label: "哈爾濱", region: "中國", country: "CN" },
  "瀋陽": { longitude: 123.4315, tzOffset: 480, label: "瀋陽", region: "中國", country: "CN" },
  "福州": { longitude: 119.2965, tzOffset: 480, label: "福州", region: "中國", country: "CN" },
  "烏魯木齊": { longitude: 87.6177, tzOffset: 480, label: "烏魯木齊", region: "中國", country: "CN" },
  "拉薩": { longitude: 91.1409, tzOffset: 480, label: "拉薩", region: "中國", country: "CN" },
  
  // 港澳
  "香港": { longitude: 114.1694, tzOffset: 480, label: "香港", region: "港澳", country: "HK" },
  "澳門": { longitude: 113.5437, tzOffset: 480, label: "澳門", region: "港澳", country: "MO" },
  
  // 東北亞
  "東京": { longitude: 139.6917, tzOffset: 540, label: "東京", region: "日本", country: "JP" },
  "大阪": { longitude: 135.5023, tzOffset: 540, label: "大阪", region: "日本", country: "JP" },
  "京都": { longitude: 135.7681, tzOffset: 540, label: "京都", region: "日本", country: "JP" },
  "名古屋": { longitude: 136.9066, tzOffset: 540, label: "名古屋", region: "日本", country: "JP" },
  "福岡": { longitude: 130.4017, tzOffset: 540, label: "福岡", region: "日本", country: "JP" },
  "札幌": { longitude: 141.3469, tzOffset: 540, label: "札幌", region: "日本", country: "JP" },
  "首爾": { longitude: 126.9780, tzOffset: 540, label: "首爾", region: "韓國", country: "KR" },
  "釜山": { longitude: 129.0756, tzOffset: 540, label: "釜山", region: "韓國", country: "KR" },
  
  // 東南亞
  "新加坡": { longitude: 103.8198, tzOffset: 480, label: "新加坡", region: "東南亞", country: "SG" },
  "吉隆坡": { longitude: 101.6869, tzOffset: 480, label: "吉隆坡", region: "東南亞", country: "MY" },
  "曼谷": { longitude: 100.5018, tzOffset: 420, label: "曼谷", region: "東南亞", country: "TH" },
  "雅加達": { longitude: 106.8456, tzOffset: 420, label: "雅加達", region: "東南亞", country: "ID" },
  "馬尼拉": { longitude: 120.9842, tzOffset: 480, label: "馬尼拉", region: "東南亞", country: "PH" },
  "河內": { longitude: 105.8342, tzOffset: 420, label: "河內", region: "東南亞", country: "VN" },
  "胡志明市": { longitude: 106.6297, tzOffset: 420, label: "胡志明市", region: "東南亞", country: "VN" },
  
  // 美洲
  "洛杉磯": { longitude: -118.2437, tzOffset: -480, label: "洛杉磯", region: "美國", country: "US" },
  "紐約": { longitude: -74.0060, tzOffset: -300, label: "紐約", region: "美國", country: "US" },
  "舊金山": { longitude: -122.4194, tzOffset: -480, label: "舊金山", region: "美國", country: "US" },
  "芝加哥": { longitude: -87.6298, tzOffset: -360, label: "芝加哥", region: "美國", country: "US" },
  "西雅圖": { longitude: -122.3321, tzOffset: -480, label: "西雅圖", region: "美國", country: "US" },
  "休斯頓": { longitude: -95.3698, tzOffset: -360, label: "休斯頓", region: "美國", country: "US" },
  "波士頓": { longitude: -71.0589, tzOffset: -300, label: "波士頓", region: "美國", country: "US" },
  "溫哥華": { longitude: -123.1207, tzOffset: -480, label: "溫哥華", region: "加拿大", country: "CA" },
  "多倫多": { longitude: -79.3832, tzOffset: -300, label: "多倫多", region: "加拿大", country: "CA" },
  
  // 歐洲
  "倫敦": { longitude: -0.1276, tzOffset: 0, label: "倫敦", region: "歐洲", country: "GB" },
  "巴黎": { longitude: 2.3522, tzOffset: 60, label: "巴黎", region: "歐洲", country: "FR" },
  "柏林": { longitude: 13.4050, tzOffset: 60, label: "柏林", region: "歐洲", country: "DE" },
  "阿姆斯特丹": { longitude: 4.9041, tzOffset: 60, label: "阿姆斯特丹", region: "歐洲", country: "NL" },
  "羅馬": { longitude: 12.4964, tzOffset: 60, label: "羅馬", region: "歐洲", country: "IT" },
  "馬德里": { longitude: -3.7038, tzOffset: 60, label: "馬德里", region: "歐洲", country: "ES" },
  "悉尼": { longitude: 151.2093, tzOffset: 600, label: "悉尼", region: "大洋洲", country: "AU" },
  "墨爾本": { longitude: 144.9631, tzOffset: 600, label: "墨爾本", region: "大洋洲", country: "AU" },
  "奧克蘭": { longitude: 174.7633, tzOffset: 720, label: "奧克蘭", region: "大洋洲", country: "NZ" },
};

// 按地區分組
const REGION_ORDER = ["台灣", "港澳", "中國", "日本", "韓國", "東南亞", "美國", "加拿大", "歐洲", "大洋洲"];

interface CitySelectorProps {
  value: string;
  onSelect: (city: string, data: typeof CITY_DATABASE[string]) => void;
  placeholder?: string;
}

export function CitySelector({ value, onSelect, placeholder = "搜尋城市..." }: CitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 按地區分組城市
  const groupedCities = useMemo(() => {
    const groups: Record<string, string[]> = {};
    
    Object.entries(CITY_DATABASE).forEach(([city, data]) => {
      if (!groups[data.region]) {
        groups[data.region] = [];
      }
      groups[data.region].push(city);
    });
    
    return groups;
  }, []);

  // 過濾城市
  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groupedCities;
    
    const filtered: Record<string, string[]> = {};
    const query = searchQuery.toLowerCase();
    
    Object.entries(groupedCities).forEach(([region, cities]) => {
      const matchedCities = cities.filter(city => 
        city.toLowerCase().includes(query) ||
        CITY_DATABASE[city].label.toLowerCase().includes(query) ||
        region.toLowerCase().includes(query)
      );
      if (matchedCities.length > 0) {
        filtered[region] = matchedCities;
      }
    });
    
    return filtered;
  }, [groupedCities, searchQuery]);

  const selectedCityData = value ? CITY_DATABASE[value] : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-input border-border text-foreground hover:bg-input/80"
        >
          {value ? (
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{selectedCityData?.label}</span>
              <span className="text-xs text-muted-foreground">
                ({selectedCityData?.longitude.toFixed(2)}°)
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground flex items-center gap-2">
              <Search className="h-4 w-4" />
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 z-[9999]" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="輸入城市名稱搜尋..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>找不到城市，請嘗試其他關鍵字</CommandEmpty>
            {REGION_ORDER.filter(region => filteredGroups[region]).map(region => (
              <CommandGroup key={region} heading={region}>
                {filteredGroups[region]?.map(city => (
                  <CommandItem
                    key={city}
                    value={city}
                    onSelect={() => {
                      onSelect(city, CITY_DATABASE[city]);
                      setOpen(false);
                      setSearchQuery("");
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === city ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="flex-1">{CITY_DATABASE[city].label}</span>
                    <span className="text-xs text-muted-foreground">
                      {CITY_DATABASE[city].longitude > 0 ? 'E' : 'W'} {Math.abs(CITY_DATABASE[city].longitude).toFixed(1)}°
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
