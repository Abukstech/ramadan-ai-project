"use client"

import { Box, Container, Text, Button, VStack, useColorModeValue, Tabs, TabList, TabPanels, Tab, TabPanel, HStack } from '@chakra-ui/react';
import { Fade, ScaleFade } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import React from 'react';
import { useState } from 'react';

const MotionBox = motion(Box);

interface Dhikr {
  arabic: string;
  translation: string;
  category: string;
  virtue?: string;
}

interface Hadith {
  arabic: string;
  translation: string;
  source: string;
  chapter?: string;
}

interface Reflection {
  content: string;
  timestamp: Date;
}

export default function DhikrGenerator(): React.ReactElement {
  const [dhikr, setDhikr] = useState<Dhikr | null>(null);
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const [isGeneratingHadith, setIsGeneratingHadith] = useState(false);
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [contentType, setContentType] = useState<'dhikr' | 'hadith'>('dhikr');
  const [currentDhikrIndex, setCurrentDhikrIndex] = useState<number>(0);
  const [dhikrList, setDhikrList] = useState<Dhikr[]>([]);
  
  const dhikrCategories = [
    { name: 'Morning', id: 'morning' },
    { name: 'Evening', id: 'evening' },
    { name: 'After Prayer', id: 'prayer' },
  ];

  const generateHadith = async (): Promise<void> => {
    setIsGeneratingHadith(true);
    try {
      const response = await fetch('/api/hadith');
      if (!response.ok) {
        throw new Error('Failed to fetch hadith');
      }
      const data = await response.json();
      const hadithData = {
        arabic: data.text,
        translation: data.text,
        source: data.source,
        chapter: data.chain[0]?.name
      };
      setHadith(hadithData);
    } catch (error) {
      console.error('Hadith generation failed:', error);
      setHadith(null);
    } finally {
      setIsGeneratingHadith(false);
    }
  };

  const loadDhikrList = async (categoryIndex: number): Promise<void> => {
    try {
      const response = await fetch('/data/categorized-adkhar.json');
      const data = await response.json();
      const category = dhikrCategories[categoryIndex].id;
      const newDhikrList = data[category];
      setDhikrList(newDhikrList);
      setCurrentDhikrIndex(0);
      setDhikr(newDhikrList[0]);
    } catch (error) {
      console.error('Dhikr loading failed:', error);
      setDhikrList([]);
      setDhikr(null);
    }
  };

  const navigateDhikr = (direction: 'prev' | 'next'): void => {
    if (dhikrList.length === 0) return;
    
    let newIndex = currentDhikrIndex;
    if (direction === 'prev') {
      newIndex = currentDhikrIndex > 0 ? currentDhikrIndex - 1 : dhikrList.length - 1;
    } else {
      newIndex = currentDhikrIndex < dhikrList.length - 1 ? currentDhikrIndex + 1 : 0;
    }
    
    setCurrentDhikrIndex(newIndex);
    setDhikr(dhikrList[newIndex]);
  };

  // Load initial dhikr list when tab changes
  React.useEffect(() => {
    if (contentType === 'dhikr') {
      loadDhikrList(tabIndex);
    }
  }, [tabIndex, contentType]);

  const generateReflection = async (): Promise<void> => {
    setIsGeneratingReflection(true);
    if (!hadith) return;
    
    try {
      const response = await fetch('/api/reflect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hadith: hadith.translation,
          type: 'hadith'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate reflection');
      }

      const { analysis } = await response.json();
      setReflection({
        content: analysis,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Reflection generation failed:', error);
      setReflection({
        content: 'Failed to generate reflection. Please try again.',
        timestamp: new Date()
      });
    } finally {
      setIsGeneratingReflection(false);
    }
  };

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={10}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Text 
            fontSize={{ base: '2xl', md: '4xl' }} 
            fontWeight="extrabold"
            textAlign="center"
            bgGradient="linear(to-r, teal.400, purple.500)"
            bgClip="text"
            pb={2}
          >
            Daily Islamic Reminders
          </Text>
        </MotionBox>

        <ScaleFade 
          in={true} 
          initialScale={0.9}
          whileHover={{ scale: 1.01 }}
          transition={{ enter: { type: 'spring', stiffness: 300 } }}
        >
          <Box
            p={8}
            borderRadius="xl"
            bg={cardBg}
            boxShadow="xl"
            w="full"
            maxW="2xl"
            borderWidth="1px"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              top: -1,
              left: -1,
              right: -1,
              bottom: -1,
              bgGradient: 'linear(to-br, teal.100, purple.100)',
              borderRadius: 'xl',
              zIndex: -1,
              filter: 'blur(8px)',
              opacity: 0.3
            }}
          >
            <Tabs 
              isFitted 
              variant="soft-rounded" 
              colorScheme="teal" 
              mb={6}
              onChange={(index) => setContentType(index === 0 ? 'dhikr' : 'hadith')}
            >
              <TabList mb={4}>
                <Tab
                  _selected={{ 
                    color: 'white', 
                    bg: 'teal.500',
                    fontWeight: 'bold'
                  }}
                >
                  Adhkar
                </Tab>
                <Tab
                  _selected={{ 
                    color: 'white', 
                    bg: 'teal.500',
                    fontWeight: 'bold'
                  }}
                >
                  Hadith
                </Tab>
              </TabList>
            </Tabs>
            
            {contentType === 'dhikr' && (
              <Tabs 
                isFitted 
                variant="soft-rounded" 
                colorScheme="purple" 
                mb={6}
                index={tabIndex}
                onChange={(index) => setTabIndex(index)}
              >
                <TabList mb={4}>
                  {dhikrCategories.map((category) => (
                    <Tab 
                      key={category.id}
                      _selected={{ 
                        color: 'white', 
                        bg: 'purple.500',
                        fontWeight: 'bold'
                      }}
                    >
                      {category.name}
                    </Tab>
                  ))}
                </TabList>
              </Tabs>
            )}
            {contentType === 'dhikr' && dhikr && (
              <Fade in={true}>
                <Text 
                  fontSize="2xl" 
                  fontFamily="'Traditional Arabic', serif"
                  textAlign="center"
                  mb={4}
                  dir="rtl"
                >
                  {dhikr.arabic}
                </Text>
                <Text fontSize="lg" fontStyle="italic" mb={4} textAlign="center">
                  {dhikr.translation}
                </Text>
                {dhikr.virtue && (
                  <Text fontSize="md" color="teal.500" mb={4} textAlign="center">
                    Virtue: {dhikr.virtue}
                  </Text>
                )}
                {/* <Text fontSize="sm" color="gray.500" textAlign="center">
                  Category: {dhikr.category}
                </Text> */}
              </Fade>
            )}

            {contentType === 'hadith' && hadith && (
              <Fade in={true}>
                <Text 
                  fontSize="2xl" 
                  fontFamily="'Traditional Arabic', serif"
                  textAlign="center"
                  mb={4}
                  dir="rtl"
                >
                  {hadith.arabic}
                </Text>
                <Text fontSize="lg" fontStyle="italic" mb={4} textAlign="center">
                  {hadith.translation}
                </Text>
                <Text fontSize="md" color="purple.500" mb={2} textAlign="center">
                  Source: {hadith.source}
                </Text>
                {hadith.chapter && (
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Chapter: {hadith.chapter}
                  </Text>
                )}
              </Fade>
            )}

            {contentType === 'hadith' && reflection && (
              <Fade in={true}>
                <Box mt={6} p={4} bg={bgColor} borderRadius="md">
                  <Text fontSize="lg">
                    {reflection.content}
                  </Text>
                </Box>
              </Fade>
            )}

            <VStack mt={8} spacing={4}>
              {contentType === 'hadith' ? (
                <>
                  <Button
                    colorScheme="teal"
                    size="lg"
                    w="full"
                    onClick={generateHadith}
                    isLoading={isGeneratingHadith}
                    loadingText="Generating..."
                    _hover={{ transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                  >
                    Generate Daily Hadith
                  </Button>
                  
                  <Button
                    colorScheme="purple"
                    size="lg"
                    w="full"
                    onClick={generateReflection}
                    isDisabled={!hadith}
                    _hover={{ transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                  >
               Reflect with AI
                  </Button>
                </>
              ) : (
                <HStack w="full" spacing={4}>
                  <Button
                    colorScheme="teal"
                    size="lg"
                    flex={1}
                    onClick={() => navigateDhikr('prev')}
                    _hover={{ transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                    leftIcon={<ChevronLeftIcon />}
                  >
                    Previous
                  </Button>
                  <Button
                    colorScheme="teal"
                    size="lg"
                    flex={1}
                    onClick={() => navigateDhikr('next')}
                    _hover={{ transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                    rightIcon={<ChevronRightIcon />}
                  >
                    Next
                  </Button>
                </HStack>
              )}
            </VStack>
          </Box>
        </ScaleFade>
      </VStack>
    </Container>
  );
}