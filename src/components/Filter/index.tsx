import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Slider from '@react-native-community/slider';

interface FilterProps {
  onFilterChange: (filters: {
    propertyType: string[];
    priceRange: [number, number];
    bedrooms: number;
    bathrooms: number;
  }) => void;
}

const Filter: React.FC<FilterProps> = ({onFilterChange}) => {
  const {t} = useTranslation();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [bedrooms, setBedrooms] = useState<number>(0);
  const [bathrooms, setBathrooms] = useState<number>(0);

  const propertyTypes = [
    {id: 'house', label: 'House'},
    {id: 'apartment', label: 'Apartment'},
    {id: 'villa', label: 'Villa'},
    {id: 'condo', label: 'Condo'},
  ];

  const handleTypeSelect = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(newTypes);
    onFilterChange({
      propertyType: newTypes,
      priceRange,
      bedrooms,
      bathrooms,
    });
  };

  const handlePriceChange = (values: [number, number]) => {
    setPriceRange(values);
    onFilterChange({
      propertyType: selectedTypes,
      priceRange: values,
      bedrooms,
      bathrooms,
    });
  };

  const handleBedroomChange = (value: number) => {
    setBedrooms(value);
    onFilterChange({
      propertyType: selectedTypes,
      priceRange,
      bedrooms: value,
      bathrooms,
    });
  };

  const handleBathroomChange = (value: number) => {
    setBathrooms(value);
    onFilterChange({
      propertyType: selectedTypes,
      priceRange,
      bedrooms,
      bathrooms: value,
    });
  };

  const handleReset = () => {
    setSelectedTypes([]);
    setPriceRange([0, 10000]);
    setBedrooms(0);
    setBathrooms(0);
    onFilterChange({
      propertyType: [],
      priceRange: [0, 10000],
      bedrooms: 0,
      bathrooms: 0,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('filter')}</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>{t('reset')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Property Type</Text>
        <View style={styles.typeContainer}>
          {propertyTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                selectedTypes.includes(type.id) && styles.selectedType,
              ]}
              onPress={() => handleTypeSelect(type.id)}
            >
              <Text
                style={[
                  styles.typeText,
                  selectedTypes.includes(type.id) && styles.selectedTypeText,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Price Range</Text>
        <View style={styles.priceContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10000}
            step={100}
            value={priceRange[1]}
            onValueChange={(value) => handlePriceChange([priceRange[0], value])}
            minimumTrackTintColor="#8BC83F"
            maximumTrackTintColor="#F5F4F8"
            thumbTintColor="#8BC83F"
          />
          <Text style={styles.priceText}>
            ${priceRange[0]} - ${priceRange[1]}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Bedrooms</Text>
        <View style={styles.quantityContainer}>
          {[0, 1, 2, 3, 4, 5].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.quantityButton,
                bedrooms === num && styles.selectedQuantity,
              ]}
              onPress={() => handleBedroomChange(num)}
            >
              <Text
                style={[
                  styles.quantityText,
                  bedrooms === num && styles.selectedQuantityText,
                ]}
              >
                {num === 0 ? 'Any' : num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Bathrooms</Text>
        <View style={styles.quantityContainer}>
          {[0, 1, 2, 3, 4].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.quantityButton,
                bathrooms === num && styles.selectedQuantity,
              ]}
              onPress={() => handleBathroomChange(num)}
            >
              <Text
                style={[
                  styles.quantityText,
                  bathrooms === num && styles.selectedQuantityText,
                ]}
              >
                {num === 0 ? 'Any' : num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
  },
  resetText: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#8BC83F',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
    marginBottom: 12,
    marginTop: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F4F8',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedType: {
    backgroundColor: '#8BC83F',
  },
  typeText: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#252B5C',
  },
  selectedTypeText: {
    color: '#FFFFFF',
    fontFamily: 'Lato-Bold',
  },
  priceContainer: {
    backgroundColor: '#F5F4F8',
    padding: 16,
    borderRadius: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  priceText: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#252B5C',
    textAlign: 'center',
    marginTop: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quantityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F4F8',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedQuantity: {
    backgroundColor: '#8BC83F',
  },
  quantityText: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#252B5C',
  },
  selectedQuantityText: {
    color: '#FFFFFF',
    fontFamily: 'Lato-Bold',
  },
});

export default Filter; 