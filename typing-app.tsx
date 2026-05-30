import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface Level {
  id: string;
  level_code: string;
  level_name: string;
  description: string;
  order_index: number;
}

interface Story {
  id: string;
  level_id: string;
  title: string;
  english_text: string;
  turkish_text: string;
  word_count: number;
  estimated_time_minutes: number;
}

interface UserProgress {
  id: string;
  user_id: string;
  story_id: string;
  level_id: string;
  wpm: number;
  accuracy: number;
  time_spent_seconds: number;
  completed_at: string;
}

interface UserMistake {
  id: string;
  user_id: string;
  story_id: string;
  word_position: number;
  english_word: string;
  typed_word: string;
  mistake_type: string;
}

interface WordTranslation {
  word: string;
  translation: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
}

interface TypingStats {
  wpm: number;
  accuracy: number;
  elapsedSeconds: number;
  totalChars: number;
  correctChars: number;
  mistakes: number;
}

// ============================================================================
// STORY DATA - 120 Stories (20 per level)
// ============================================================================

const STORIES_DATA: Record<string, Story[]> = {
  'A1': [
    {
      id: 'a1-1',
      level_id: 'a1',
      title: 'My Name',
      english_text: 'Hello. My name is John. I am from England. I like cats.',
      turkish_text: 'Merhaba. Adım John. İngiltere\'deneyim. Kedileri seviyorum.',
      word_count: 12,
      estimated_time_minutes: 1
    },
    {
      id: 'a1-2',
      level_id: 'a1',
      title: 'The Apple',
      english_text: 'I have an apple. The apple is red. It is sweet. I eat the apple.',
      turkish_text: 'Bir elmam var. Elma kırmızı. Tatlı. Elmayı yiyorum.',
      word_count: 14,
      estimated_time_minutes: 1
    },
    {
      id: 'a1-3',
      level_id: 'a1',
      title: 'My Family',
      english_text: 'I have a mother. I have a father. I have a sister. We are happy.',
      turkish_text: 'Bir annem var. Bir babam var. Bir kız kardeşim var. Mutluyuz.',
      word_count: 14,
      estimated_time_minutes: 1
    },
    {
      id: 'a1-4',
      level_id: 'a1',
      title: 'At School',
      english_text: 'I go to school. I learn English. The teacher is nice. I have friends.',
      turkish_text: 'Okula gidiyorum. İngilizce öğreniyorum. Öğretmen hoş. Arkadaşlarım var.',
      word_count: 13,
      estimated_time_minutes: 1
    },
    {
      id: 'a1-5',
      level_id: 'a1',
      title: 'The Weather',
      english_text: 'Today is sunny. The sun is bright. It is warm. I like the sun.',
      turkish_text: 'Bugün güneşli. Güneş parlak. Sıcak. Güneşi severim.',
      word_count: 12,
      estimated_time_minutes: 1
    },
    {
      id: 'a1-6',
      level_id: 'a1',
      title: 'Colors',
      english_text: 'Red is a color. Blue is a color. Yellow is a color. They are nice.',
      turkish_text: 'Kırmızı bir renk. Mavi bir renk. Sarı bir renk. Güzeller.',
      word_count: 13,
      estimated_time_minutes: 1
    },
    {
      id: 'a1-7',
      level_id: 'a1',
      title: 'Animals',
      english_text: 'A dog is an animal. A cat is an animal. A bird is an animal.',
      turkish_text: 'Bir köpek bir hayvandır. Bir kedi bir hayvandır. Bir kuş bir hayvandır.',
      word_count: 13,
      estimated_time_minutes: 1
    },
    {
      id: 'a1-8',
      level_id: 'a1',
      title: 'Numbers',
      english_text: 'One and two make three. Three and two make five. I can count.',
      turkish_text: 'Bir artı iki üç eder. Üç artı iki beş eder. Sayabilirim.',
      word_count: 12,
      estimated_time_minutes: 1
    },
    {
      id: 'a1-9',
      level_id: 'a1',
      title: 'Food',
      english_text: 'I eat rice. I eat bread. I drink water. Food is good.',
      turkish_text: 'Pirinç yerim. Ekmek yerim. Su içerim. Yemek iyidir.',
      word_count: 12,
      estimated_time_minutes: 1
    },
    {
      id: 'a1-10',
      level_id: 'a1',
      title: 'My Room',
      english_text: 'I have a room. My room is small. I have a bed. I have a table.',
      turkish_text: 'Bir odamız var. Odamız küçük. Bir yatağım var. Bir masam var.',
      word_count: 14,
      estimated_time_minutes: 1
    },
    {
      id: 'a1-11',
      level_id: 'a1',
      title: 'Morning',
      english_text: 'I wake up in the morning. I wash my face. I eat breakfast.',
      turkish_text: 'Sabah uyandırım. Yüzümü yıkayım. Kahvaltı yerim.',
      word_count: 11,
      estimated_time_minutes: 1
    },
    {
      id: 'a1-12',
      level_id: 'a1',
      title: 'The Park',
      english_text: 'I go to the park. The park is big. There are trees. There are flowers.',
      turkish_text: 'Parka gidiyorum. Park büyük. Ağaçlar var. Çiçekler var.',
      word_count: 14,
      estimated_time_minutes: 1
    },
    {
      id: 'a1-13',
      level_id: 'a1',
      title: 'Clothes',
      english_text: 'I wear a shirt. I wear pants. I wear shoes. They are blue.',
      turkish_text: 'Bir gömlek giyiyorum. Pantolon giyiyorum. Ayakkabı giyiyorum. Mavi.',
      word_count: 12,
      estimated_time_minutes: 1
    },
    {
      id: 'a1-14',
      level_id: 'a1',
      title: 'The House',
      english_text: 'I live in a house. The house is nice. It has a door. It has windows.',
      turkish_text: 'Bir evde yaşıyorum. Ev hoş. Bir kapısı var. Pencereleri var.',
      word_count: 14,
      estimated_time_minutes: 1
    },
    {
      id: 'a1-15',
      level_id: 'a1',
      title: 'Sports',
      english_text: 'I play football. I play tennis. I like sports. Sports are fun.',
      turkish_text: 'Futbol oynuyorum. Tenis oynuyorum. Sporu severim. Spor eğlenceli.',
      word_count: 12,
      estimated_time_minutes: 1
    },
    {
      id: 'a1-16',
      level_id: 'a1',
      title: 'Books',
      english_text: 'I have a book. The book is good. I read books. Books are nice.',
      turkish_text: 'Bir kitabım var. Kitap iyi. Kitap okurum. Kitaplar güzel.',
      word_count: 12,
      estimated_time_minutes: 1
    },
    {
      id: 'a1-17',
      level_id: 'a1',
      title: 'The Market',
      english_text: 'I go to the market. I buy fruit. I buy vegetables. They are fresh.',
      turkish_text: 'Pazara gidiyorum. Meyve alıyorum. Sebze alıyorum. Taze.',
      word_count: 12,
      estimated_time_minutes: 1
    },
    {
      id: 'a1-18',
      level_id: 'a1',
      title: 'Water',
      english_text: 'Water is blue. Water is cold. I drink water. Water is good for me.',
      turkish_text: 'Su mavi. Su soğuk. Su içerim. Su bana iyi.',
      word_count: 12,
      estimated_time_minutes: 1
    },
    {
      id: 'a1-19',
      level_id: 'a1',
      title: 'Night',
      english_text: 'At night I sleep. The night is dark. Stars shine. I sleep well.',
      turkish_text: 'Gece uyuyorum. Gece karanlık. Yıldızlar parlıyor. İyi uyuyorum.',
      word_count: 12,
      estimated_time_minutes: 1
    },
    {
      id: 'a1-20',
      level_id: 'a1',
      title: 'Friend',
      english_text: 'I have a friend. My friend is kind. We play together. We are happy.',
      turkish_text: 'Bir arkadaşım var. Arkadaşım iyi. Birlikte oynuyoruz. Mutluyuz.',
      word_count: 12,
      estimated_time_minutes: 1
    }
  ],
  'A2': [
    {
      id: 'a2-1',
      level_id: 'a2',
      title: 'A Day at School',
      english_text: 'My school day starts at eight o\'clock. I study mathematics and English. At lunch, I eat sandwiches and drink juice. My favourite subject is English. After school, I go home and do my homework.',
      turkish_text: 'Okul günüm saat sekizde başlar. Matematik ve İngilizce okurum. Öğle yemeğinde sandviç yerim ve meyve suyu içerim. Sevdiğim konu İngilizce. Okuldan sonra eve giderim ve ödevimi yaparım.',
      word_count: 42,
      estimated_time_minutes: 2
    },
    {
      id: 'a2-2',
      level_id: 'a2',
      title: 'My Hobby',
      english_text: 'I like playing guitar. I started learning guitar two years ago. I practice every day for thirty minutes. My teacher is very patient. I can play many songs now. Music makes me very happy.',
      turkish_text: 'Gitar çalmayı severim. İki yıl önce gitar öğrenmeye başladım. Her gün otuz dakika pratik yaparım. Öğretmenim çok sabırlı. Şimdi birçok şarkı çalabilirim. Müzik beni çok mutlu ediyor.',
      word_count: 37,
      estimated_time_minutes: 2
    },
    {
      id: 'a2-3',
      level_id: 'a2',
      title: 'The Restaurant',
      english_text: 'Yesterday, I went to a restaurant with my family. The restaurant was very nice and clean. We ordered chicken, fish, and salad. The food was delicious. We drank coffee after our meal. It was a wonderful evening.',
      turkish_text: 'Dün ailemle bir restoran gittim. Restoran çok güzel ve temizdi. Tavuk, balık ve salata sipariş ettik. Yemek çok lezzetliydi. Yemekten sonra kahve içtik. Harika bir gece oldu.',
      word_count: 40,
      estimated_time_minutes: 2
    },
    {
      id: 'a2-4',
      level_id: 'a2',
      title: 'Weekend Plans',
      english_text: 'On Saturday morning, I will visit my grandmother. She lives in the countryside. We will have lunch together. In the afternoon, we will walk in the garden. On Sunday, I will stay home and watch a film with my family.',
      turkish_text: 'Cumartesi sabahı ninemi ziyaret edeceğim. Kırsalda yaşıyor. Öğle yemeği yiyeceğiz. Öğleden sonra bahçede yürüyeceğiz. Pazar günü evde kalacağım ve aileme birlikte film izleyeceğim.',
      word_count: 40,
      estimated_time_minutes: 2
    },
    {
      id: 'a2-5',
      level_id: 'a2',
      title: 'Health and Exercise',
      english_text: 'I exercise three times a week. I go running on Monday and Wednesday mornings. On Friday, I go to the swimming pool. Exercise is important for our health. I also eat healthy food and drink plenty of water every day.',
      turkish_text: 'Haftada üç gün egzersiz yapıyorum. Pazartesi ve Çarşamba sabahları koşuyorum. Cuma günü yüzme havuzuna gidiyorum. Egzersiz sağlığımız için önemli. Ayrıca sağlıklı yemek yerim ve her gün çok su içerim.',
      word_count: 39,
      estimated_time_minutes: 2
    },
    {
      id: 'a2-6',
      level_id: 'a2',
      title: 'Learning Languages',
      english_text: 'I am learning English because it is very useful. I study with books, videos, and apps. I also watch films and listen to music in English. My pronunciation is getting better. I want to speak English fluently in the future.',
      turkish_text: 'İngilizce öğreniyorum çünkü çok faydalı. Kitaplarla, videolarla ve uygulamalarla okurum. Ayrıca İngilizce filmleri izler ve müzik dinlerim. Telaffuzum daha iyi oluyor. Gelecekte akıcı bir şekilde İngilizce konuşmak istiyorum.',
      word_count: 38,
      estimated_time_minutes: 2
    },
    {
      id: 'a2-7',
      level_id: 'a2',
      title: 'The Shopping Mall',
      english_text: 'Last week, I went to the shopping mall with my friend. We looked at clothes and shoes. I bought a new jacket and two pairs of shoes. My friend bought a book and a cup. We also drank coffee at the mall café.',
      turkish_text: 'Geçen hafta arkadaşımla alışveriş merkezine gittim. Elbise ve ayakkabılara baktık. Yeni bir ceket ve iki çift ayakkabı aldım. Arkadaşım bir kitap ve bir fincan aldı. Ayrıca merkez kafésinde kahve içtik.',
      word_count: 40,
      estimated_time_minutes: 2
    },
    {
      id: 'a2-8',
      level_id: 'a2',
      title: 'Travel and Holidays',
      english_text: 'I love travelling to different countries. Last summer, I went to France. I visited Paris and saw many famous buildings. The weather was sunny and warm. I tried French food and it was very tasty. I want to go there again.',
      turkish_text: 'Farklı ülkelere seyahat etmeyi seviyorum. Geçen yaz Fransa\'ya gittim. Paris\'i ziyaret ettim ve birçok ünlü binayı gördüm. Hava güneşli ve sıcaktı. Fransız yemeği denedim ve çok lezzetliydi. Orada tekrar gitmek istiyorum.',
      word_count: 42,
      estimated_time_minutes: 2
    },
    {
      id: 'a2-9',
      level_id: 'a2',
      title: 'Technology',
      english_text: 'I use my computer every day. I work, study, and play games on it. I also have a smartphone. I use it to send messages, take photos, and listen to music. Technology is very helpful in our daily life.',
      turkish_text: 'Her gün bilgisayarımı kullanıyorum. Üzerinde çalışır, okurum ve oyun oynarım. Ayrıca bir akıllı telefonum var. İleti göndermek, fotoğraf çekmek ve müzik dinlemek için kullanıyorum. Teknoloji günlük hayatımızda çok faydalı.',
      word_count: 40,
      estimated_time_minutes: 2
    },
    {
      id: 'a2-10',
      level_id: 'a2',
      title: 'A Rainy Day',
      english_text: 'Yesterday was a rainy day. The sky was grey and cloudy. Rain fell all day long. I stayed at home and read a book. My cat sat on my lap. We watched the rain together. It was a peaceful day.',
      turkish_text: 'Dün yağmurlu bir gündü. Gökyüzü gri ve bulutluydu. Bütün gün yağmur yağdı. Evde kaldım ve bir kitap okudum. Kedim kucağımda oturdu. Yağmuru birlikte izledik. Huzurlu bir gündü.',
      word_count: 38,
      estimated_time_minutes: 2
    },
    {
      id: 'a2-11',
      level_id: 'a2',
      title: 'Birthday Party',
      english_text: 'My brother\'s birthday was last Saturday. We organized a party at home. We invited many friends and family. We played games and watched films. We had a big cake with candles. Everyone sang happy birthday. It was very fun and enjoyable.',
      turkish_text: 'Kardeşimin doğum günü geçen cumartesiydi. Evde bir parti organize ettik. Birçok arkadaş ve aile davet ettik. Oyun oynadık ve film izledik. Mumlu büyük bir pasta vardı. Herkes doğum günü şarkısı söyledi. Çok eğlenceli ve keyifli oldu.',
      word_count: 42,
      estimated_time_minutes: 2
    },
    {
      id: 'a2-12',
      level_id: 'a2',
      title: 'Cooking',
      english_text: 'I like cooking in the kitchen. My favourite dish is pasta. I use flour, eggs, and butter to make pasta dough. I add tomato sauce and cheese. Cooking takes about one hour. My family enjoys my cooking very much.',
      turkish_text: 'Mutfakta yemek yapmayı severim. En sevdiğim yemek makarnalı. Hamur yapmak için un, yumurta ve tereyağ kullanıyorum. Domates sosu ve peynir ekliyorum. Yemek yapmak yaklaşık bir saat sürer. Ailem benim yemeğimi çok beğeniyor.',
      word_count: 38,
      estimated_time_minutes: 2
    },
    {
      id: 'a2-13',
      level_id: 'a2',
      title: 'Cinema',
      english_text: 'I go to the cinema twice a month. I like watching comedy films and action films. Last week, I saw a very interesting film. It was about adventure and mystery. The actors were excellent. I recommend it to all my friends.',
      turkish_text: 'Ayda iki kez sinemaya gidiyorum. Komedi ve aksiyon filmleri izlemeyi severim. Geçen hafta çok ilginç bir film izledim. Macera ve gizem hakkındaydı. Oyuncular mükemmmel. Tüm arkadaşlarıma tavsiye ediyorum.',
      word_count: 37,
      estimated_time_minutes: 2
    },
    {
      id: 'a2-14',
      level_id: 'a2',
      title: 'The Zoo',
      english_text: 'Last month, I visited the zoo with my family. We saw many different animals. The lions were very big and strong. The monkeys were funny and playful. We also saw beautiful birds with colourful feathers. It was an amazing day.',
      turkish_text: 'Geçen ay aileme çle hayvankçık ziyaret ettim. Birçok farklı hayvan gördük. Aslanlar çok büyük ve güçlüydü. Maymunlar komik ve oyunculardı. Ayrıca renkli tüylü güzel kuşlar gördük. Harika bir gündü.',
      word_count: 38,
      estimated_time_minutes: 2
    },
    {
      id: 'a2-15',
      level_id: 'a2',
      title: 'Season Changes',
      english_text: 'Spring is my favourite season. The weather becomes warm and sunny. Flowers bloom in the gardens. The trees have green leaves. People wear light clothes. In spring, everything looks fresh and beautiful. I love walking in the park.',
      turkish_text: 'İlkbahar benim en sevdiğim mevsimidir. Hava sıcak ve güneşli olur. Bahçelerde çiçekler açar. Ağaçların yeşil yaprakları vardır. İnsanlar hafif elbiseler giyerler. İlkbaharında her şey taze ve güzel görünür. Parkta yürüyüşe çıkmayı seviyorum.',
      word_count: 41,
      estimated_time_minutes: 2
    },
    {
      id: 'a2-16',
      level_id: 'a2',
      title: 'Morning Routine',
      english_text: 'My morning routine is very simple. I wake up at seven o\'clock. I take a shower and brush my teeth. I have breakfast with tea and bread. I check my email and messages. Then I go to work. A good morning makes a good day.',
      turkish_text: 'Sabah rutinimiz çok basit. Saat yedide uyanırım. Duş alırım ve dişlerimi fırçalarım. Çay ve ekmekle kahvaltı yapıyorum. E-postalarımı ve mesajlarımı kontrol ediyorum. Sonra işe gidiyorum. Güzel bir sabah güzel bir gün yapar.',
      word_count: 39,
      estimated_time_minutes: 2
    },
    {
      id: 'a2-17',
      level_id: 'a2',
      title: 'Moving House',
      english_text: 'Last month, my family moved to a new house. The new house is bigger and has more rooms. We bought new furniture and painted the walls. My bedroom is now much larger. I like the new house very much. It is a wonderful place for my family.',
      turkish_text: 'Geçen ay ailem yeni bir eve taşındı. Yeni ev daha büyük ve daha fazla odası var. Yeni mobilya aldık ve duvarları boyattık. Yatak odamız çok daha geniş. Yeni evi çok severim. Aileme için harika bir yer.',
      word_count: 42,
      estimated_time_minutes: 2
    },
    {
      id: 'a2-18',
      level_id: 'a2',
      title: 'Playing Sports',
      english_text: 'I joined a football club three months ago. I train every Tuesday and Thursday evening. The coach teaches us new techniques and strategies. Our team has won three games this season. I am very proud of our progress. Sports are very good for health and friendship.',
      turkish_text: 'Üç ay önce bir futbol kulübüne katıldım. Her Salı ve Perşembe akşamı antrenman yapıyorum. Antrenör bize yeni teknikler ve stratejiler öğretiyor. Takımımız bu sezon üç maç kazandı. Ilerleyişimizle çok gururluyum. Spor sağlık ve dostluk için çok iyidir.',
      word_count: 42,
      estimated_time_minutes: 2
    },
    {
      id: 'a2-19',
      level_id: 'a2',
      title: 'Gardening',
      english_text: 'I enjoy gardening in my garden. I grow tomatoes, carrots, and lettuce. Every morning, I water the plants and remove weeds. In summer, the vegetables are ready to eat. Growing your own food is very satisfying and healthy.',
      turkish_text: 'Bahçemde bahçıvanlık yapmayı severim. Domates, havuç ve marul yetiştiriyorum. Her sabah bitkileri sulamak ve yabani ot temizlemek. Yazında sebzeler yenmesi hazır. Kendi yemeğinizi yetiştirmek çok tatmin edici ve sağlıklı.',
      word_count: 38,
      estimated_time_minutes: 2
    },
    {
      id: 'a2-20',
      level_id: 'a2',
      title: 'Reading Books',
      english_text: 'I read books every evening before sleep. I like reading adventure stories and mystery novels. Books take me to different worlds and places. They teach me new things and new words. Reading is my favourite hobby. I have about fifty books in my collection.',
      turkish_text: 'Her akşam uyumadan önce kitap okurum. Macera hikayeleri ve gizem romanlarını okumayı severim. Kitaplar beni farklı dünyalara ve yerlere götürüyor. Bana yeni şeyler ve yeni kelimeler öğretiyorlar. Okumak benim en sevdiğim hobidir. Koleksiyonumda yaklaşık elli kitap var.',
      word_count: 42,
      estimated_time_minutes: 2
    }
  ],
  'B1': [
    {
      id: 'b1-1',
      level_id: 'b1',
      title: 'Sustainable Living',
      english_text: 'In today\'s world, sustainability is becoming increasingly important. Many people are making conscious decisions to reduce their environmental footprint. This includes using renewable energy, recycling, and reducing plastic consumption. Companies are also implementing green initiatives to protect our planet. These collective efforts can make a significant difference in combating climate change and preserving the environment for future generations.',
      turkish_text: 'Günümüzde sürdürülebilirlik giderek daha önemli hale geliyor. Birçok insan çevresel ayakizlerini azaltmak için bilinçli kararlar alıyorlar. Buna yenilenebilir enerji kullanmak, geri dönüştürmek ve plastik tüketimini azaltmak dahil. Şirketler de gezegenimizi korumak için yeşil girişimleri uyguluyor. Bu ortak çabalar iklim değişikliğiyle mücadelede ve çevreyi gelecek nesiller için korumada önemli bir fark yaratabilir.',
      word_count: 62,
      estimated_time_minutes: 3
    },
    {
      id: 'b1-2',
      level_id: 'b1',
      title: 'The Digital Age',
      english_text: 'The digital age has transformed how we communicate and work. Internet connectivity has become essential in our lives. Social media platforms allow us to connect with people worldwide. Remote work has become more common, especially after the pandemic. However, this increased digital reliance also brings challenges regarding privacy and cybersecurity that society must address carefully.',
      turkish_text: 'Dijital çağ, iletişim ve çalışma şeklimizi dönüştürdü. İnternet bağlantısı hayatımızda gerekli hale geldi. Sosyal medya platformları, dünya çapında insanlarla bağlantı kurmamıza izin veriyor. Özellikle pandemiden sonra uzaktan çalışma daha yaygın hale geldi. Ancak bu artan dijital bağımlılık, gizlilik ve siber güvenlik konusunda toplumun dikkatle ele alması gereken zorluklar da beraberinde getiriyor.',
      word_count: 62,
      estimated_time_minutes: 3
    },
    {
      id: 'b1-3',
      level_id: 'b1',
      title: 'Cultural Exchange',
      english_text: 'Cultural exchange programs are valuable opportunities for understanding different perspectives and ways of life. Students and professionals benefit from experiencing diverse cultures and traditions. These programs foster international cooperation and reduce cultural misunderstandings. Through language learning, travel, and collaborative projects, people develop greater empathy and appreciation for global diversity. Such initiatives strengthen bonds between nations and promote peaceful coexistence.',
      turkish_text: 'Kültür değişim programları, farklı perspektifler ve yaşam tarzlarını anlamak için değerli fırsatlardır. Öğrenciler ve profesyoneller çeşitli kültür ve gelenekleri deneyimlemekten yararlanırlar. Bu programlar uluslararası işbirliğini teşvik eder ve kültürel yanlış anlaşılmaları azaltır. Dil öğrenme, seyahat ve işbirlikçi projeler aracılığıyla, insanlar küresel çeşitliliğe karşı daha fazla empati ve takdir geliştirirler. Bu tür girişimler uluslar arasındaki bağları güçlendirir ve barışçıl bir arada yaşamayı teşvik eder.',
      word_count: 67,
      estimated_time_minutes: 3
    },
    {
      id: 'b1-4',
      level_id: 'b1',
      title: 'Education and Technology',
      english_text: 'Technology is revolutionizing the education sector in unprecedented ways. Online learning platforms provide access to quality education regardless of geographical location. Interactive tools and multimedia content enhance student engagement and understanding. Teachers can now personalize learning experiences using artificial intelligence. However, educators must ensure that technology complements rather than replaces traditional teaching methods and human interaction.',
      turkish_text: 'Teknoloji, eğitim sektörünü benzeri görülmemiş şekillerde devrim yapıyor. Çevrimiçi öğrenme platformları, coğrafi konum ne olursa olsun kaliteli eğitime erişim sağlar. Etkileşimli araçlar ve multimedya içeriği öğrenci katılımını ve anlayışını artırır. Öğretmenler artık yapay zeka kullanarak öğrenme deneyimlerini kişiselleştirebilirler. Ancak, eğitimciler teknolojinin geleneksel öğretim yöntemleri ve insan etkileşimini yerine almak yerine tamamlamasını sağlamalıdır.',
      word_count: 65,
      estimated_time_minutes: 3
    },
    {
      id: 'b1-5',
      level_id: 'b1',
      title: 'Mental Health Awareness',
      english_text: 'Mental health has gained recognition as an essential aspect of overall wellbeing. Society is progressively breaking stigma surrounding mental illness and psychological challenges. Organizations provide counselling services and support groups for individuals struggling with depression, anxiety, and stress. Regular exercise, meditation, and social connections contribute significantly to mental health. Awareness campaigns encourage people to prioritize their psychological wellbeing alongside physical health.',
      turkish_text: 'Ruh sağlığı, genel refahın temel bir yönü olarak kabul görmüştür. Toplum, ruh hastalığı ve psikolojik zorlukları çevreleyen damgaları kademeli olarak kırıyor. Kuruluşlar, depresyon, kaygı ve stresle mücadele eden bireyler için danışmanlık hizmetleri ve destek grupları sağlıyor. Düzenli egzersiz, meditasyon ve sosyal bağlantılar ruh sağlığına önemli ölçüde katkıda bulunur. Farkındalık kampanyaları, insanları fiziksel sağlıkla birlikte psikolojik refahlarını önceliklendirmeye teşvik eder.',
      word_count: 68,
      estimated_time_minutes: 3
    },
    {
      id: 'b1-6',
      level_id: 'b1',
      title: 'Global Economy',
      english_text: 'The global economy is interconnected in complex ways that affect both developing and developed nations. International trade creates opportunities for growth and employment. Multinational corporations operate across borders, influencing local economies and employment patterns. Economic policies implemented by major countries have worldwide ramifications. Understanding global economic trends helps individuals and businesses make informed decisions about investments and career development.',
      turkish_text: 'Küresel ekonomi, hem gelişmekte olan hem de gelişmiş ülkeleri etkileyen karmaşık şekillerde birbirine bağlıdır. Uluslararası ticaret, büyüme ve istihdam için fırsatlar yaratır. Çok uluslu şirketler sınırlar arasında faaliyet gösterir, yerel ekonomileri ve istihdam modellerini etkiler. Büyük ülkeler tarafından uygulanan ekonomik politikaların dünya çapında sonuçları vardır. Küresel ekonomik trendleri anlamak, bireylerin ve işletmelerin yatırım ve kariyer gelişimi hakkında bilinçli kararlar vermesine yardımcı olur.',
      word_count: 70,
      estimated_time_minutes: 3
    },
    {
      id: 'b1-7',
      level_id: 'b1',
      title: 'Urban Development',
      english_text: 'Cities are rapidly expanding and transforming to accommodate growing populations. Urban planners design infrastructure that balances economic development with environmental sustainability. Public transportation, green spaces, and affordable housing are essential components of modern cities. However, rapid urbanization creates challenges including traffic congestion, pollution, and social inequality. Effective city planning requires collaboration between governments, businesses, and communities.',
      turkish_text: 'Şehirler, artan nüfusa uyum sağlamak için hızla genişliyor ve dönüşüyor. Şehir plancıları, ekonomik kalkınmayı çevre sürdürülebilirliği ile dengeleyen altyapı tasarlarlar. Toplu ulaşım, yeşil alanlar ve uygun fiyatlı konut, modern şehirlerin temel bileşenleridir. Ancak hızlı şehirleşme, trafik sıkışıklığı, kirlilik ve sosyal eşitsizlik dahil zorluklar yaratır. Etkili şehir planlaması, hükümetler, işletmeler ve topluluklar arasında işbirliği gerektirir.',
      word_count: 68,
      estimated_time_minutes: 3
    },
    {
      id: 'b1-8',
      level_id: 'b1',
      title: 'Health and Nutrition',
      english_text: 'Proper nutrition is fundamental to maintaining a healthy lifestyle and preventing chronic diseases. A balanced diet includes fruits, vegetables, whole grains, and lean proteins. Understanding food labels and making conscious dietary choices empowers individuals to improve their health outcomes. Nutritionists recommend regular physical activity combined with nutritious meals for optimal wellbeing. Public health campaigns increasingly emphasize the importance of preventative care and healthy living habits.',
      turkish_text: 'Uygun beslenme, sağlıklı bir yaşam tarzını sürdürmek ve kronik hastalıkları önlemek için temeldir. Dengeli bir diyette meyveler, sebzeler, tam tahıllar ve yağsız proteinler bulunur. Gıda etiketlerini anlamak ve bilinçli diyet tercihlerini yapmak, bireylerin sağlık sonuçlarını iyileştirmelerini sağlar. Beslenme uzmanları, optimal sağlık için düzenli fiziksel aktivitenin besleyici öğünlerle birleştirilmesini önerir. Halk sağlığı kampanyaları giderek önleyici bakım ve sağlıklı yaşam alışkanlıklarının önemini vurgulıyor.',
      word_count: 67,
      estimated_time_minutes: 3
    },
    {
      id: 'b1-9',
      level_id: 'b1',
      title: 'Language Learning',
      english_text: 'Learning a foreign language opens doors to new opportunities and cultural understanding. Language learners develop cognitive skills including enhanced memory and problem-solving abilities. Immersion in a language environment accelerates learning progress significantly. Technology has made language learning more accessible through apps, online courses, and virtual tutoring. Dedication and consistent practice are key factors in achieving fluency and confidence in communication.',
      turkish_text: 'Yabancı bir dil öğrenmek, yeni fırsatlara ve kültürel anlayışa kapı açar. Dil öğrenenleri, geliştirilmiş hafıza ve sorun çözme yetenekleri de dahil bilişsel beceriler geliştirirler. Bir dil ortamında daldırılmak, öğrenme ilerleme hızını önemli ölçüde hızlandırır. Teknoloji, uygulamalar, çevrimiçi kurslar ve sanal özel dersler aracılığıyla dil öğrenimini daha erişilebilir hale getirmiştir. Adanmışlık ve tutarlı uygulamaya, akıcılık ve iletişimde güven kazanmanın ana faktörleridir.',
      word_count: 66,
      estimated_time_minutes: 3
    },
    {
      id: 'b1-10',
      level_id: 'b1',
      title: 'Entertainment Industry',
      english_text: 'The entertainment industry generates significant economic value and cultural influence worldwide. Streaming platforms have revolutionized content consumption, offering diverse programming on demand. Film, television, and music industries continue to evolve with changing audience preferences and technological innovations. Content creators use advanced technology to produce high-quality productions. The industry faces challenges balancing artistic expression with commercial demands and addressing representation issues.',
      turkish_text: 'Eğlence endüstrisi, dünya çapında önemli ekonomik değer ve kültürel etki yaratmaktadır. Akış platformları, çeşitli içeriği isteğe bağlı olarak sunan içerik tüketiminde devrim yarattı. Film, televizyon ve müzik endüstrileri, değişen izleyici tercihlerine ve teknolojik yeniliklere göre evrileceği devam ediyor. İçerik oluşturucular, yüksek kaliteli yapımlar üretmek için gelişmiş teknoloji kullanırlar. Endüstri, artistik ifade ile ticari talep arasında denge kurmak ve temsil sorunlarını gidermek konusunda zorlukla karşı karşıyadır.',
      word_count: 70,
      estimated_time_minutes: 3
    },
    {
      id: 'b1-11',
      level_id: 'b1',
      title: 'Environmental Conservation',
      english_text: 'Environmental conservation is crucial for preserving biodiversity and protecting endangered species. Protected areas and national parks serve as sanctuaries for wildlife and ecosystems. Conservation efforts include habitat restoration, pollution control, and sustainable resource management. International agreements and collaborative initiatives bring nations together to address environmental challenges. Individuals can contribute through conscious consumption, supporting conservation organizations, and making eco-friendly choices.',
      turkish_text: 'Çevre koruma, biyolojik çeşitliliği korumak ve tehlike altındaki türleri korumak için çok önemlidir. Korunan alanlar ve ulusal parklar, yaban hayatı ve ekosistemlerin sığınağı görev yaparlar. Koruma çabaları, habitat restorasyonu, kirlilik kontrolü ve sürdürülebilir kaynak yönetimini içerir. Uluslararası anlaşmalar ve işbirlikçi girişimler, ülkeleri çevre zorlukları gidermek için bir araya getir. Bireyler bilinçli tüketim, koruma kuruluşlarını desteklemek ve çevre dostu seçimler yaparak katkıda bulunabilirler.',
      word_count: 68,
      estimated_time_minutes: 3
    },
    {
      id: 'b1-12',
      level_id: 'b1',
      title: 'Career Development',
      english_text: 'Career development requires continuous learning and professional growth throughout one\'s working life. Individuals benefit from acquiring new skills, pursuing certifications, and seeking mentorship opportunities. Networking and maintaining professional relationships open doors to career advancement. Companies are increasingly investing in employee development through training programs and workshops. Success in today\'s dynamic job market depends on adaptability and commitment to self-improvement.',
      turkish_text: 'Kariyer gelişimi, çalışma hayatı boyunca sürekli öğrenme ve profesyonel büyüme gerektirir. Bireyler, yeni beceriler kazanmak, sertifikalar takip etmek ve mentorluk fırsatlarını aramaktan yararlanırlar. Ağ oluşturmak ve profesyonel ilişkileri korumak kariyer ilerlemesine kapı açar. Şirketler, eğitim programları ve atölyeler aracılığıyla çalışan gelişimine giderek daha fazla yatırım yapıyorlar. Günümüzün dinamik iş pazarında başarı, uyum sağlama yeteneğine ve kendini geliştirmeye bağlılığa bağlıdır.',
      word_count: 67,
      estimated_time_minutes: 3
    },
    {
      id: 'b1-13',
      level_id: 'b1',
      title: 'Travel and Tourism',
      english_text: 'Travel offers enriching experiences and opportunities to explore different cultures and landscapes. Tourism contributes substantially to local economies by creating jobs and generating revenue. Sustainable tourism practices minimize environmental impact while benefiting local communities. Cultural tourism allows visitors to learn about historical sites and traditional ways of life. Responsible travel requires respect for local customs, environments, and the preservation of cultural heritage.',
      turkish_text: 'Seyahat, farklı kültürleri ve peyzajları keşfetmek için zenginleştirici deneyimler ve fırsatlar sunar. Turizm, istihdam yaratarak ve gelir sağlayarak yerel ekonomilere önemli ölçüde katkıda bulunur. Sürdürülebilir turizm uygulamaları, çevresel etkiyi en aza indirirken yerel topluluklara fayda sağlar. Kültür turizmi, ziyaretçilerin tarihi yerleri ve geleneksel yaşam tarzlarını öğrenmelerini sağlar. Sorumlu seyahat, yerel gümrüklere, çevreye ve kültürel mirasın korunmasına saygı gerektirir.',
      word_count: 68,
      estimated_time_minutes: 3
    },
    {
      id: 'b1-14',
      level_id: 'b1',
      title: 'Innovation and Creativity',
      english_text: 'Innovation drives progress and economic growth across multiple sectors. Creative thinking and problem-solving are essential skills in today\'s competitive landscape. Organizations encourage innovation through research and development investments and employee brainstorming sessions. Technology enables individuals and teams to collaborate and share ideas across global distances. Balancing innovation with practical implementation challenges requires vision, resilience, and effective project management.',
      turkish_text: 'İnovasyon, birden fazla sektörde ilerleme ve ekonomik büyüme sürüyor. Yaratıcı düşünce ve sorun çözme, günümüzün rekabetçi ortamında temel becerilerdir. Kuruluşlar, araştırma ve geliştirme yatırımları ve çalışan beyin fırtınası seansları aracılığıyla yeniliği teşvik ederler. Teknoloji, bireylerin ve ekiplerin fikirlerini paylaşmak ve küresel mesafelerde işbirliği yapmalarını sağlar. İnovasyonu pratik uygulama zorlukları ile dengelelemek vizyon, dayanıklılık ve etkili proje yönetimi gerektirir.',
      word_count: 66,
      estimated_time_minutes: 3
    },
    {
      id: 'b1-15',
      level_id: 'b1',
      title: 'Sports and Fitness',
      english_text: 'Regular physical activity is vital for maintaining physical health and mental wellbeing. Sports provide opportunities for personal development, teamwork, and healthy competition. Fitness regimens should be tailored to individual goals and physical capabilities. Professional athletes inspire millions through their dedication and achievement. Sports organizations work to make athletic pursuits accessible to people of all ages and abilities.',
      turkish_text: 'Düzenli fiziksel aktivite, fiziksel sağlık ve ruh sağlığını korumak için hayati önemlidir. Spor, kişisel gelişim, takım çalışması ve sağlıklı rekabet fırsatları sağlar. Fitness rejimleri, bireysel hedeflere ve fiziksel yeteneğe göre uyarlanmalıdır. Profesyonel atletler, kendilerine adanmışlıkları ve başarılarıyla milyonları ilhamlandırırlar. Spor kuruluşları, atletik uygulamaları her yaştan ve yeteneğe sahip insanlar için erişilebilir kılmak için çalışırlar.',
      word_count: 67,
      estimated_time_minutes: 3
    },
    {
      id: 'b1-16',
      level_id: 'b1',
      title: 'Food Traditions',
      english_text: 'Culinary traditions reflect a culture\'s history, geography, and values deeply. Traditional recipes are passed down through generations, preserving cultural identity and heritage. Local ingredients and cooking methods create distinctive flavors characteristic of each cuisine. Food festivals celebrate cultural diversity and bring communities together. In our globalized world, appreciating diverse food traditions promotes cultural understanding and respect.',
      turkish_text: 'Mutfak gelenekleri, bir kültürün tarihini, coğrafyasını ve değerlerini derin bir şekilde yansıtır. Geleneksel tarifler, kültürel kimliği ve mirası koruyan kuşaklar boyunca aktarılır. Yerel malzemeler ve pişirme yöntemleri, her mutfağı karakterize eden belirgin tatlar yaratır. Yemek festivalleri, kültürel çeşitliliği kutlar ve toplulukları bir araya getirir. Globalleşmiş dünyamızda, çeşitli yemek geleneklerine saygı göstermek kültürel anlayış ve saygıyı teşvik eder.',
      word_count: 67,
      estimated_time_minutes: 3
    },
    {
      id: 'b1-17',
      level_id: 'b1',
      title: 'Art and Culture',
      english_text: 'Art and culture express human creativity and emotional experience in profound ways. Museums and galleries provide spaces for artists to showcase their work and educate the public. Contemporary art often challenges conventional perspectives and raises important social questions. Cultural events and performances celebrate diversity and foster community identity. Investment in arts education develops critical thinking skills and creative expression in young people.',
      turkish_text: 'Sanat ve kültür, insan yaratıcılığını ve duygusal deneyimini derin şekillerde ifade ederler. Müzeler ve galeriler, sanatçıların çalışmalarını sergilemesi ve halka eğitim vermesi için alanlar sağlarlar. Çağdaş sanat, genellikle geleneksel perspektiflere meydan okur ve önemli sosyal soruları gündeme getirir. Kültür etkinlikleri ve gösteriler, çeşitliliği kutlar ve topluluk kimliğini güçlendirir. Sanat eğitimine yatırım, genç insanlarda eleştirel düşünme becerilerini ve yaratıcı ifadeyi geliştir.',
      word_count: 68,
      estimated_time_minutes: 3
    },
    {
      id: 'b1-18',
      level_id: 'b1',
      title: 'Science and Discovery',
      english_text: 'Scientific research continuously expands human knowledge and understanding of the world. Breakthroughs in medicine, physics, and biology improve quality of life and solve complex problems. Collaboration among international scientific communities accelerates the pace of discovery. Science education inspires young minds to pursue careers in research and innovation. Funding for scientific research is essential to maintaining progress in solving humanity\'s greatest challenges.',
      turkish_text: 'Bilimsel araştırma, insan bilgisini ve dünyanın anlaşılmasını sürekli olarak genişletir. Tıp, fizik ve biyoloji alanındaki atılımlar, yaşam kalitesini iyileştirir ve karmaşık sorunları çözer. Uluslararası bilim insanı toplulukları arasında işbirliği, keşif hızını hızlandırır. Fen bilimleri eğitimi, genç fikirleri araştırma ve yenililik kariyerlerini takip etmeye ilhamlandırır. Bilimsel araştırmaya finansman, insanlığın en büyük zorlukları çözmede ilerleme sağlamak için gereklidir.',
      word_count: 67,
      estimated_time_minutes: 3
    },
    {
      id: 'b1-19',
      level_id: 'b1',
      title: 'Social Responsibility',
      english_text: 'Corporate social responsibility initiatives address societal challenges and contribute to community wellbeing. Businesses increasingly recognize their obligations to environmental sustainability and ethical practices. Employee volunteer programs and charitable donations support important causes and foster team cohesion. Social responsibility extends beyond financial contributions to include transparency and accountability. Organizations that prioritize social responsibility build stronger relationships with stakeholders and customers.',
      turkish_text: 'Kurumsal sosyal sorumluluk girişimleri, toplumsal zorlukları ele alır ve topluluk refahına katkıda bulunur. İşletmeler, çevre sürdürülebilirliğine ve etik uygulamalara yönelik yükümlülüklerinin giderek daha fazla farkındadırlar. Çalışan gönüllü programları ve hayır kurumuna yapılan bağışlar önemli nedenleri destekler ve ekip uyum sağlamını destekler. Sosyal sorumluluk, mali katkıların ötesine geçerek şeffaflık ve hesap verebilirliği içerir. Sosyal sorumluluğu önceliklendiren kuruluşlar, paydaşlar ve müşterilerle daha güçlü ilişkiler kurar.',
      word_count: 68,
      estimated_time_minutes: 3
    },
    {
      id: 'b1-20',
      level_id: 'b1',
      title: 'Infrastructure Development',
      english_text: 'Modern infrastructure systems are critical foundations for economic development and quality of life. Transportation networks facilitate commerce and connectivity between regions and countries. Water and sanitation systems are essential for public health and disease prevention. Energy infrastructure must transition toward renewable sources for environmental sustainability. Investment in infrastructure creates employment opportunities and drives long-term economic growth.',
      turkish_text: 'Modern altyapı sistemleri, ekonomik kalkınma ve yaşam kalitesinin kritik temelleridir. Ulaştırma ağları, bölgeler ve ülkeler arasında ticaret ve bağlantıyı kolaylaştırır. Su ve sanitasyon sistemleri, halk sağlığı ve hastalık önleme için gereklidir. Enerji altyapısı, çevre sürdürülebilirliği için yenilenebilir kaynaklara yönelmelidir. Altyapıya yatırım, istihdam fırsatları yaratır ve uzun vadeli ekonomik büyümeyi sürüklüyor.',
      word_count: 67,
      estimated_time_minutes: 3
    }
  ],
  'B2': [
    {
      id: 'b2-1',
      level_id: 'b2',
      title: 'Artificial Intelligence Revolution',
      english_text: 'Artificial intelligence is fundamentally reshaping industries and society in unprecedented ways. Machine learning algorithms analyze vast datasets to identify patterns and make predictions. Natural language processing enables computers to understand and generate human language with remarkable accuracy. The integration of AI in healthcare, finance, and transportation promises to solve long-standing challenges. However, this technological advancement raises profound ethical questions about privacy, job displacement, and algorithmic bias that require thoughtful regulation and societal consensus.',
      turkish_text: 'Yapay zeka, endüstrileri ve toplumu benzeri görülmemiş şekillerde temelden yeniden şekillendiriyor. Makine öğrenme algoritmaları, örüntüleri tanımlamak ve tahminlerde bulunmak için geniş veri setlerini analiz eder. Doğal dil işleme, bilgisayarların insan dilini olağanüstü doğrulukla anlamasını ve üretmesini sağlar. Yapay zekanın sağlık, finans ve ulaştırmada entegre edilmesi, uzun süredir süren zorlukları çözmek için umut veriyor. Ancak bu teknolojik ilerleme, gizlilik, işsizlik ve algoritmasal önyargı hakkında derin etik soruları gündeme getiriyor.',
      word_count: 78,
      estimated_time_minutes: 4
    },
    {
      id: 'b2-2',
      level_id: 'b2',
      title: 'Climate Crisis Solutions',
      english_text: 'The climate crisis demands immediate and comprehensive action from governments, businesses, and individuals. Transitioning to renewable energy sources is essential to reducing carbon emissions significantly. Carbon pricing mechanisms and circular economy principles encourage sustainable consumption patterns. Reforestation and ocean conservation efforts are vital for carbon sequestration and ecosystem restoration. International cooperation through frameworks like the Paris Agreement is indispensable for coordinating global climate action. Success requires balancing environmental preservation with economic development and social equity.',
      turkish_text: 'İklim krizi, hükümetler, işletmeler ve bireylerden derhal ve kapsamlı hareketi gerektiriyor. Yenilenebilir enerji kaynaklarına geçiş, karbon emisyonlarını önemli ölçüde azaltmak için gereklidir. Karbon fiyatlandırması mekanizmaları ve dairesel ekonomi ilkeleri, sürdürülebilir tüketim modellerini teşvik eder. Ağaçlandırma ve okyanus koruma çabaları, karbon tutma ve ekosistem restorasyonu için hayati önem taşıyor. Paris Anlaşması gibi çerçeveler aracılığıyla uluslararası işbirliği, küresel iklim hareketini koordine etmek için vazgeçilmez. Başarı, çevre koruma ile ekonomik kalkınma ve sosyal eşitliği dengelemek gerektirir.',
      word_count: 82,
      estimated_time_minutes: 4
    },
    {
      id: 'b2-3',
      level_id: 'b2',
      title: 'Pandemic and Public Health',
      english_text: 'The global pandemic revealed vulnerabilities in public health systems and international cooperation mechanisms. Vaccine development and distribution demonstrated both scientific achievement and logistical challenges. Misinformation and vaccine hesitancy complicated efforts to achieve population immunity. Mental health impacts from isolation and economic disruption require long-term psychological support. Future pandemic preparedness demands strengthened surveillance systems, equitable healthcare access, and investment in infectious disease research. The experience emphasizes the interconnectedness of global health and the necessity for coordinated international responses.',
      turkish_text: 'Küresel pandemi, halk sağlığı sistemlerinde ve uluslararası işbirliği mekanizmalarında güvenlik açıklarını ortaya çıkardı. Aşı geliştirme ve dağıtımı, bilimsel başarı ve lojistik zorluklar göstermiştir. Yanlış bilgi ve aşı tereddütü, nüfus bağışıklığına ulaşma çabalarını karmaşıklaştırdı. İzolasyon ve ekonomik kesintiden kaynaklanan ruh sağlığı etkileri, uzun vadeli psikolojik destek gerektiriyor. Gelecekteki pandemi hazırlığı, güçlendirilmiş gözetim sistemleri, eşit sağlık hizmetine erişim ve bulaşıcı hastalık araştırmasına yatırım talep ediyor.',
      word_count: 78,
      estimated_time_minutes: 4
    },
    {
      id: 'b2-4',
      level_id: 'b2',
      title: 'Economic Inequality',
      english_text: 'Economic inequality has reached unprecedented levels globally, creating social tension and limiting opportunities. Income disparities are driven by factors including globalization, technological displacement, and policy choices. Progressive taxation, education investment, and social safety nets are mechanisms for reducing inequality. However, addressing root causes requires systemic changes in how wealth is distributed and created. Sustainable economic growth depends on broader access to opportunities and resources for disadvantaged populations. The challenge lies in balancing market efficiency with social justice and equitable development.',
      turkish_text: 'Ekonomik eşitsizlik, dünya çapında benzeri görülmemiş seviyelere ulaşmış, sosyal gerilim yaratıyor ve fırsatları sınırlıyor. Gelir eşitsizlikleri, küreselleşme, teknolojik yer değiştirme ve politika seçimleri dahil faktörlerle sürülüyor. Artan vergilendirme, eğitime yatırım ve sosyal güvenlik ağları eşitsizliği azaltmak için mekanizmalar. Ancak, kök nedenleri ele almak, servetin nasıl dağıtıldığı ve yaratıldığında sistemik değişiklikler gerektirir. Sürdürülebilir ekonomik büyüme, dezavantajlı nüfuslar için daha geniş fırsatlara ve kaynaklara erişim bağlıdır.',
      word_count: 76,
      estimated_time_minutes: 4
    },
    {
      id: 'b2-5',
      level_id: 'b2',
      title: 'Digital Privacy',
      english_text: 'Digital privacy has become a fundamental concern as technology companies collect unprecedented amounts of personal data. Data breaches expose millions to identity theft and financial fraud risks. Governments implement regulations like GDPR to protect citizen privacy and establish digital rights. Surveillance capitalism raises questions about consent and corporate power over personal information. Individuals must become vigilant about digital literacy and privacy protection in an increasingly connected world. Balancing innovation with privacy protection remains an ongoing challenge for policymakers and technologists.',
      turkish_text: 'Dijital gizlilik, teknoloji şirketleri benzeri görülmemiş miktarlarda kişisel verileri topladığından beri temel bir endişe haline gelmiştir. Veri ihlalleri milyonları kimlik hırsızlığı ve finansal sahtekarlık riskleriyle karşı karşıya bırakmaktadır. Hükümetler, vatandaş gizliliğini korumak ve dijital hakları oluşturmak için GDPR gibi düzenlemeleri uygular. Gözetim kapitalizmi, kişisel bilgiler üzerinde onay ve kurumsal güç hakkında soruları gündeme getiriyor. Bireyler, giderek bağlantılı bir dünyada dijital okuryazarlık ve gizlilik koruması konusunda tetikte olmalıdırlar. İnovasyonu gizlilik koruması ile dengelelemek, politika yapıcılar ve teknologlar için devam eden bir zorluk olmaya devam ediyor.',
      word_count: 77,
      estimated_time_minutes: 4
    },
    {
      id: 'b2-6',
      level_id: 'b2',
      title: 'Immigration and Integration',
      english_text: 'Immigration contributes significantly to cultural diversity and economic vitality in host countries. Migrants bring skills, entrepreneurship, and perspectives that drive innovation and growth. However, integration challenges include language barriers, discrimination, and access to employment and services. Successful integration requires coordinated policies combining language programs, job training, and community engagement. Political rhetoric around immigration often oversimplifies complex realities and impacts public perception. Evidence-based policy approaches can maximize benefits while addressing legitimate integration concerns.',
      turkish_text: 'Göçmenlik, ev sahibi ülkelerdeki kültürel çeşitliliğe ve ekonomik vitaliteye önemli ölçüde katkıda bulunur. Göçmenler, yeniliği ve büyümeyi sürüklüyen beceriler, girişimcilik ve perspektifler getirirler. Ancak, entegrasyon zorlukları dil bariyerleri, ayrımcılık ve istihdamı ve hizmetlere erişimi içerir. Başarılı entegrasyon, dil programlarını, iş eğitimini ve topluluk katılımını birleştiren koordineli politikaları gerektirir. Göçmenlik konusundaki siyasi söylem, genellikle karmaşık gerçeklikleri basitleştirir ve halka algısını etkiler. Kanıta dayalı politika yaklaşımları, yasal entegrasyon endişelerini ele alırken faydaları maksimize edebilir.',
      word_count: 76,
      estimated_time_minutes: 4
    },
    {
      id: 'b2-7',
      level_id: 'b2',
      title: 'Workplace Transformation',
      english_text: 'The modern workplace is undergoing radical transformation due to technological advancement and changing work culture. Remote work, flexible schedules, and distributed teams have become mainstream post-pandemic. Automation is displacing traditional jobs while creating demand for new skill sets. Employee wellbeing and work-life balance have gained importance alongside productivity metrics. Organizations adopting agile methodologies and collaborative cultures attract and retain talent more effectively. The future workplace requires continuous adaptation and investment in professional development.',
      turkish_text: 'Modern çalışma yeri, teknolojik ilerleme ve değişen çalışma kültürü nedeniyle radikal dönüşüme uğramaktadır. Uzaktan çalışma, esnek çizelgeler ve dağıtılmış ekipler pandemi sonrası ana akım haline gelmiştir. Otomasyon, geleneksel işleri yer değiştirirken yeni beceri setlerine talep yaratmaktadır. Çalışan refahı ve iş-yaşam dengesine üretkenlik metriklerine yanında önem verilmiştir. Çevik metodoloji ve işbirlikçi kültürleri benimseyen kuruluşlar, yetenekleri daha etkili bir şekilde çeker ve tutar. Gelecekteki çalışma alanı sürekli uyum ve mesleki gelişime yatırım gerektirir.',
      word_count: 76,
      estimated_time_minutes: 4
    },
    {
      id: 'b2-8',
      level_id: 'b2',
      title: 'Space Exploration',
      english_text: 'Space exploration pushes the boundaries of human knowledge and technological capability. Private companies now compete with government agencies in launching satellites and deep space missions. Understanding planetary systems and searching for extraterrestrial life address fundamental questions about humanity\'s place in the universe. Space technology has practical applications including communication systems, weather forecasting, and GPS. The environmental cost and ethical questions of space resource extraction require careful consideration. Future space exploration requires sustained funding and international cooperation for ambitious long-term missions.',
      turkish_text: 'Uzay araştırması, insan bilgisinin ve teknolojik yeteneğinin sınırlarını zorluyor. Özel şirketler şimdi uyduları ve derin uzay görevlerini başlatmada devlet kurumları ile rekabet ediyorlar. Gezegen sistemlerini anlamak ve yabancı yaşam araştırması, insanlığın evrende yerinin temel sorularını adresler. Uzay teknolojisinin iletişim sistemleri, hava durumu tahmini ve GPS dahil pratik uygulamaları vardır. Uzay kaynak çıkarmanın çevresel maliyeti ve etik soruları dikkatli bir şekilde ele alınması gerekir. Gelecekteki uzay araştırması, iddialı uzun vadeli görevler için sürdürülen finansman ve uluslararası işbirliği gerektirir.',
      word_count: 76,
      estimated_time_minutes: 4
    },
    {
      id: 'b2-9',
      level_id: 'b2',
      title: 'Media Literacy',
      english_text: 'Media literacy has become crucial in an age of information overload and misinformation. Critical evaluation of sources helps distinguish reliable journalism from propaganda and conspiracy theories. Algorithmic bias in social media feeds creates filter bubbles that reinforce existing beliefs. Deepfakes and manipulated content pose emerging threats to truth and public discourse. Educational initiatives promoting media literacy are essential for developing informed citizens. Understanding how media shapes perception and influences opinion is vital in democratic societies.',
      turkish_text: 'Medya okuryazarlığı, bilgi aşırı yüklemesi ve yanlış bilginin çağında gerekli hale gelmiştir. Kaynakları kritik değerlendirmesi, güvenilir gazetecilik ile propaganda ve komplo teorilerini ayırt etmeye yardımcı olur. Sosyal medya beslemelerinde algoritmasal önyargı, mevcut inançları güçlendiren filtre kabarcıkları yaratır. Deepfakeler ve manipüle edilmiş içerik, gerçeğe ve halka tartışmasına ortaya çıkan tehditler oluşturur. Medya okuryazarlığını teşvik eden eğitim girişimleri, bilgili vatandaşlar geliştirmek için gereklidir. Medyanın algıyı nasıl şekillendirdiğini ve görüşü nasıl etkilediğini anlamak demokratik toplumlarda hayati önem taşıyor.',
      word_count: 76,
      estimated_time_minutes: 4
    },
    {
      id: 'b2-10',
      level_id: 'b2',
      title: 'Urban Farming',
      english_text: 'Urban farming initiatives bring food production to city environments, addressing food security and sustainability. Vertical gardens, rooftop farms, and community gardens increase green space in concrete jungles. Local food production reduces transportation emissions and supports community economies. Urban farming creates employment opportunities and reconnects people with food sources. These projects also provide environmental benefits including improved air quality and urban cooling. Scaling urban agriculture requires policy support and innovative solutions for space and resource constraints.',
      turkish_text: 'Kentsel tarım girişimleri, gıda üretimini şehir ortamlarına getiriyor, gıda güvenliğini ve sürdürülebilirliği ele alıyor. Dikey bahçeler, çatı çiftlikleri ve topluluk bahçeleri, beton ormanlarında yeşil alanı artırır. Yerel gıda üretimi, ulaştırma emisyonlarını azaltır ve topluluk ekonomilerini destekler. Kentsel tarım, istihdam fırsatları yaratır ve insanları gıda kaynakları ile yeniden bağlantılandırır. Bu projeler hava kalitesi iyileştirilmesi ve kentsel soğutma da dahil çevresel faydalar sağlar. Kentsel tarımı ölçeklendirmek, alan ve kaynak kısıtlamaları için politika desteği ve yenilikçi çözümleri gerektirir.',
      word_count: 75,
      estimated_time_minutes: 4
    },
    {
      id: 'b2-11',
      level_id: 'b2',
      title: 'Biodiversity Protection',
      english_text: 'Biodiversity protection is essential for ecosystem stability and human wellbeing. Habitat destruction, pollution, and climate change threaten species extinction at unprecedented rates. Protected areas and wildlife corridors enable animal migration and genetic diversity preservation. Conservation strategies combine enforcement against poaching with community engagement and education. Indigenous knowledge systems often provide effective approaches to sustainable resource management. International agreements like CITES regulate trade in endangered species. Success requires balancing conservation goals with local economic development needs.',
      turkish_text: 'Biyolojik çeşitlilik koruması, ekosistem istikrarı ve insan refahı için gereklidir. Habitat yok edilmesi, kirlilik ve iklim değişikliği türleri benzeri görülmemiş oranlarda tehdid ediyor. Korunan alanlar ve yaşam alanları koridorları, hayvan göçünü ve genetik çeşitlilik korumasını etkinleştir. Koruma stratejileri, kaçakçılığa karşı uygulama zorlama ile topluluk katılımı ve eğitimini birleştirir. Yerli bilgi sistemleri genellikle sürdürülebilir kaynak yönetimi için etkili yaklaşımlar sağlar. CITES gibi uluslararası anlaşmalar, tehlike altındaki türleri ticaretini düzenler. Başarı, koruma hedefleri ile yerel ekonomik kalkınma ihtiyaçlarını dengelemek gerektirir.',
      word_count: 75,
      estimated_time_minutes: 4
    },
    {
      id: 'b2-12',
      level_id: 'b2',
      title: 'Gender Equality',
      english_text: 'Gender equality remains a critical development goal despite progress in many regions. Educational disparities affect girls\' access to opportunities and future economic outcomes. Women face discrimination in employment, promotion, and wage equity. Political representation gaps limit women\'s influence on policy decisions affecting their communities. Violence and harassment against women persist across all socioeconomic levels. Achieving gender equality requires systemic changes in education, workplace practices, laws, and cultural attitudes. Evidence shows societies with greater gender equality experience improved economic growth and social stability.',
      turkish_text: 'Cinsiyet eşitliği, pek çok bölgede ilerleme olmasına rağmen kritik bir kalkınma hedefi olmaya devam ediyor. Eğitim eşitsizlikleri, kızların fırsatlara ve gelecek ekonomik sonuçlara erişimini etkiler. Kadınlar, istihdam, terfi ve ücret eşitliğinde ayrımcılık ile karşı karşıyadır. Siyasi temsil açıkları, kadınların toplumlarını etkileyen politika kararlarında etkisini sınırlıyor. Kadınlara yönelik şiddet ve taciz, tüm sosyoekonomik seviyelerde devam ediyor. Cinsiyet eşitliğine ulaşmak, eğitim, çalışma alanı uygulamaları, yasalar ve kültürel tutumlar için sistemik değişiklikler gerektirir.',
      word_count: 76,
      estimated_time_minutes: 4
    },
    {
      id: 'b2-13',
      level_id: 'b2',
      title: 'Corporate Ethics',
      english_text: 'Corporate ethics addresses the moral and social responsibilities of business organizations. Supply chain transparency reveals labor conditions and environmental impacts of production. Ethical sourcing and fair trade practices support workers and communities in developing nations. Executive compensation and stakeholder governance raise questions about fairness and accountability. Environmental responsibility extends beyond compliance to genuine commitment to sustainability. Companies demonstrating strong ethical standards build trust and long-term stakeholder relationships. Regulatory frameworks and industry standards increasingly demand accountability and transparent reporting.',
      turkish_text: 'Kurumsal etik, iş kuruluşlarının ahlaksal ve sosyal sorumluluklarını ele alır. Tedarik zinciri saydamlığı, üretimin işçi koşullarını ve çevresel etkilerini ortaya çıkarır. Etik kaynaklama ve adil ticaret uygulamaları, gelişmekte olan ülkelerdeki işçileri ve toplulukları destekler. Yönetici tazminatı ve paydaş yönetişimi, adalet ve sorumluluk hakkında soruları gündeme getiriyor. Çevre sorumluluğu, uyumluluğun ötesine geçerek sürdürülebilirliğe gerçek taahhüt. Güçlü etik standartlar sergileyen şirketler, güven ve uzun vadeli paydaş ilişkilerini inşa ederler.',
      word_count: 75,
      estimated_time_minutes: 4
    },
    {
      id: 'b2-14',
      level_id: 'b2',
      title: 'Ocean Conservation',
      english_text: 'Ocean conservation is vital for maintaining marine ecosystems and global food security. Overfishing depletes fish stocks and disrupts ecological balance. Plastic pollution and ocean acidification pose existential threats to marine life. Marine protected areas help preserve biodiversity and allow fish populations to recover. Sustainable fishing practices and aquaculture innovations reduce pressure on wild populations. International maritime laws and enforcement mechanisms work to prevent illegal fishing. Climate change impacts ocean temperatures and currents, requiring urgent mitigation actions.',
      turkish_text: 'Okyanus koruması, deniz ekosistemlerini ve küresel gıda güvenliğini korumak için hayati önem taşıyor. Aşırı balıkçılık, balık stoklarını azaltıyor ve ekolojik dengeyi bozuyor. Plastik kirlilik ve okyanus asitleşmesi, deniz hayatına varoluşsal tehditler oluşturur. Deniz korunan alanları, biyolojik çeşitliliği korumaya yardımcı oluyor ve balık popülasyonlarının iyileşmesine izin veriyor. Sürdürülebilir balıkçılık uygulamaları ve su ürünleri yetiştiriciliği yenilikleri, vahşi popülasyonlara baskıyı azaltmaktadır. Uluslararası denizcilik yasaları ve yaptırım mekanizmaları, yasa dışı balıkçılığı önlemek için çalışmaktadır.',
      word_count: 75,
      estimated_time_minutes: 4
    },
    {
      id: 'b2-15',
      level_id: 'b2',
      title: 'Mental Health Support',
      english_text: 'Mental health systems require substantial investment and innovative approaches to meet growing demand. Psychological disorders including depression and anxiety affect productivity and quality of life. Stigma reduction campaigns help normalize mental health discussions and encourage help-seeking behavior. Workplace mental health programs and school-based interventions provide early support. Digital mental health solutions increase accessibility for those in remote or underserved areas. Professional counselling and psychiatric medication options offer evidence-based treatment approaches. Preventive strategies emphasizing stress management and resilience building improve population mental health.',
      turkish_text: 'Ruh sağlığı sistemleri, artan talep karşılamak için önemli yatırım ve yenilikçi yaklaşımlar gerektirir. Depresyon ve kaygı dahil psikolojik bozukluklar, üretkenliği ve yaşam kalitesini etkiler. Stigma azaltma kampanyaları, ruh sağlığı tartışmalarını normalleştirmeye yardımcı olur ve yardım arama davranışını teşvik eder. Çalışma alanı ruh sağlığı programları ve okul tabanlı müdahaleler erken destek sağlar. Dijital ruh sağlığı çözümleri, uzak veya yetersiz hizmet alan alanlardaki kişiler için erişilebilirliği artırır.',
      word_count: 75,
      estimated_time_minutes: 4
    },
    {
      id: 'b2-16',
      level_id: 'b2',
      title: 'Cybersecurity',
      english_text: 'Cybersecurity threats continue evolving as technology advances and attacks become more sophisticated. Data breaches compromise personal information affecting millions of individuals and organizations. Ransomware attacks disrupt critical infrastructure including hospitals and government systems. Nation-state hacking raises concerns about geopolitical conflicts extending into digital domains. Cybersecurity education and awareness programs are essential for individual and organizational protection. Investment in robust security infrastructure and incident response protocols minimizes damage from attacks. International cooperation on cybercrime legislation and standards strengthens collective defense mechanisms.',
      turkish_text: 'Siber güvenlik tehditleri, teknoloji ilerlemesi ve saldırılar daha karmaşık hale geldikçe gelişmektedir. Veri ihlalleri, milyonlarca bireyi ve kuruluşu etkileyen kişisel bilgilerin tehlikeye düşmesine. Fidye yazılımı saldırıları, hastaneler ve devlet sistemleri dahil kritik altyapıyı kesintiye uğratmaktadır. Ulus devlet hacking, jeopolitik çatışmaların dijital alanlara uzanması hakkında endişeler gündeme getiriyor. Siber güvenlik eğitimi ve farkındalık programları, kişi ve kuruluş koruması için gereklidir. Sağlam güvenlik altyapısı ve olay yanıt protokollerine yatırım, saldırılardan hasarı en aza indirir.',
      word_count: 75,
      estimated_time_minutes: 4
    },
    {
      id: 'b2-17',
      level_id: 'b2',
      title: 'Renewable Energy Transition',
      english_text: 'The transition to renewable energy is fundamental to addressing climate change and energy security. Solar, wind, and hydroelectric power have become cost-competitive with fossil fuels. Energy storage technologies including batteries are essential for grid reliability with intermittent sources. Smart grid systems optimize electricity distribution and consumption patterns efficiently. Job creation in renewable sectors provides economic opportunities during the energy transition. Government incentives, carbon pricing, and regulatory frameworks accelerate adoption. However, infrastructure investment and geopolitical considerations regarding rare earth materials complicate the transition.',
      turkish_text: 'Yenilenebilir enerjiye geçiş, iklim değişikliğini ve enerji güvenliğini ele almak için temeldir. Güneş, rüzgar ve hidroelektrik güç, fosil yakıtlarla maliyet rekabetçi hale gelmiştir. Piller dahil enerji depolama teknolojileri, aralıklı kaynaklar ile ızgara güvenilirliği için gereklidir. Akıllı ızgara sistemleri, elektrik dağıtımını ve tüketim modellerini etkili bir şekilde optimize eder. Yenilenebilir sektörlerde istihdam yaratılması, enerji geçişi sırasında ekonomik fırsatları sağlar. Devlet teşvikleri, karbon fiyatlandırması ve düzenleyici çerçeveler benimsemeyi hızlandırır.',
      word_count: 75,
      estimated_time_minutes: 4
    },
    {
      id: 'b2-18',
      level_id: 'b2',
      title: 'Higher Education',
      english_text: 'Higher education systems must adapt to changing workforce demands and technological disruption. Universities increasingly emphasize critical thinking and practical skills alongside traditional academic knowledge. Online and hybrid learning models expand access to education beyond geographic limitations. Collaboration between academia and industry ensures curricula remain relevant to employment markets. Graduate debt burdens affect young professionals\' financial stability and economic contribution. Diversity in higher education enriches learning environments and addresses historical inequities. Funding challenges require innovative approaches to maintain quality and accessibility.',
      turkish_text: 'Yüksek öğretim sistemleri, değişen iş gücü taleplerini ve teknolojik aksamalarına uyum sağlamak gerekir. Üniversiteler giderek geleneksel akademik bilginin yanında kritik düşünce ve pratik becerileri vurgular. Çevrimiçi ve melez öğrenme modelleri, coğrafi sınırlamalar ötesinde eğitime erişimi genişletir. Akademi ve endüstri arasında işbirliği, müfredatının işgücü piyasaları için alakalı kalmasını sağlar. Mezun borç yükleri, genç profesyonelleri finansal istikrar ve ekonomik katkı etkiler. Yüksek öğretimde çeşitlilik, öğrenme ortamlarını zenginleştirir ve tarihi eşitsizlikleri ele alır.',
      word_count: 75,
      estimated_time_minutes: 4
    },
    {
      id: 'b2-19',
      level_id: 'b2',
      title: 'Artificial Organs',
      english_text: 'Bioengineering and tissue engineering are developing artificial organs to address organ shortage crises. 3D bioprinting technology enables creation of complex organ structures using living cells. Xenotransplantation research explores using animal organs modified for human compatibility. Organ donation systems face challenges including insufficient donor availability and allocation ethics. Artificial organs could revolutionize transplantation medicine and improve patient outcomes. Regulatory pathways and safety testing remain challenging for emerging organ replacement technologies. Success requires continued investment in research and collaboration between medical and engineering disciplines.',
      turkish_text: 'Biyomühendislik ve doku mühendisliği, organ kıtlığı krizlerini ele almak için yapay organlar geliştirmektedir. 3D biyoprinting teknolojisi, canlı hücreler kullanarak karmaşık organ yapıları oluşturmayı sağlar. Xenotransplantasyon araştırması, insan uyumluluğu için değiştirilmiş hayvan organlarını kullanmayı araştırıyor. Organ bağışı sistemleri, yetersiz bağışçı mevcudiyeti ve tahsis etiği dahil zorluklar ile karşı karşıyadır. Yapay organlar nakil tıbbını devrim yapabilir ve hasta sonuçlarını iyileştirebilir. Düzenleyici yollar ve güvenlik testi, ortaya çıkan organ değiştirme teknolojileri için zor kalmaktadır.',
      word_count: 75,
      estimated_time_minutes: 4
    },
    {
      id: 'b2-20',
      level_id: 'b2',
      title: 'Geopolitics and Global Order',
      english_text: 'Contemporary geopolitics reflects shifting power dynamics and competing visions for global governance. Rising powers challenge Western-dominated international institutions and propose alternative frameworks. Trade tensions and technology competition create economic friction between nations. Regional conflicts and ethnic tensions threaten international stability and peace. Multilateral diplomacy and international law provide mechanisms for peaceful conflict resolution. Environmental and health crises demonstrate the necessity of global cooperation. Future international order depends on balancing national interests with shared humanity\'s common challenges.',
      turkish_text: 'Çağdaş jeopolitik, değişen güç dinamiklerini ve küresel yönetişimin rakip vizyonlarını yansıtmaktadır. Yükselen güçler, Batı tarafından hakimiyetindeki uluslararası kurumları soruyor ve alternatif çerçeveler önerir. Ticaret gerginlikleri ve teknoloji rekabeti, ulus devletler arasında ekonomik fraksiyonu yaratır. Bölgesel çatışmalar ve etnik gerilimler, uluslararası istikrarı ve barışı tehdit eder. Çok taraflı diplomasi ve uluslararası hukuk, barışçıl çatışma çözümü için mekanizmalar sağlar. Çevresel ve sağlık krizleri, küresel işbirliğinin gerekliliğini göstermektedir. Gelecekteki uluslararası düzen, ulusal çıkarları paylaşılan insanlığın ortak zorlukları ile dengelelemek bağlıdır.',
      word_count: 75,
      estimated_time_minutes: 4
    }
  ],
  'C1': [
    {
      id: 'c1-1',
      level_id: 'c1',
      title: 'Philosophical Phenomenology',
      english_text: 'Phenomenology, as elucidated by Husserl and further developed by Heidegger, fundamentally interrogates the nature of consciousness and subjective experience. This philosophical methodology brackets external reality to examine the essential structures of intentionality. The discipline advocates that understanding human existence necessitates rigorous examination of consciousness itself. Contemporary phenomenological discourse grapples with the implications of embodied cognition and intersubjectivity. The phenomenological reduction, while theoretically elegant, presents formidable epistemological challenges when applied to empirical investigation. This approach fundamentally contrasts with positivistic methodologies that prioritize objective measurement and external validation. Modern applications extend phenomenology into cognitive science and artificial intelligence research, raising profound questions about the nature of subjective experience.',
      turkish_text: 'Husserl tarafından ortaya konulan ve Heidegger tarafından daha da geliştirilen fenomenoloji, bilinç doğası ve öznel deneyimi temel olarak sorgular. Bu felsefi metodoloji, dış gerçekliği ayırmak için bilinç yapılarını incelemektedir. Disiplin, insan varlığını anlamanın bilincin kendisinin titiz incelemesini gerektirdiğini savunur. Çağdaş fenomenolojik söylem, somutlaştırılmış biliş ve öznelerarası ilişkilerin etkileri ile mücadele ediyor. Fenomenolojik indirgeme, teorik olarak zarif olsa da, ampirik araştırmaya uygulandığında formidable epistemolojik zorluklar sunar.',
      word_count: 88,
      estimated_time_minutes: 5
    },
    {
      id: 'c1-2',
      level_id: 'c1',
      title: 'Linguistic Pragmatics',
      english_text: 'Pragmatics transcends traditional semantics by examining how context shapes communicative intent and interpretation. Speech act theory, pioneered by Austin and refined by Searle, demonstrates that utterances function as performative gestures beyond mere propositional content. Conversational implicature, as formulated by Grice, reveals the underlying conventions governing cooperative discourse. The distinction between literal meaning and speaker intention illuminates fundamental aspects of linguistic competence. Politeness theory and face-saving mechanisms demonstrate how social hierarchies permeate linguistic exchanges. Digital communication introduces novel challenges regarding contextual disambiguation and non-verbal cue substitution. Contemporary pragmatic analysis must accommodate multimodal communication and the fluidity of meaning-making in networked environments.',
      turkish_text: 'Pragmatikler, bağlamın iletişimsel niyeti ve yorumlamayı nasıl şekillendirdiğini inceleyerek geleneksel anlambilimi aşmaktadır. Austin tarafından öncülüğü yapılan ve Searle tarafından rafine edilen konuşma edimi teorisi, ifadelerin sadece önermeli içeriğin ötesinde performatif hareketler olarak işlev gördüğünü göstermektedir. Grice tarafından formüle edilen konuşmayı taşıyan ima, işbirlikçi söylemi yöneten alttaki kuralları ortaya çıkarmaktadır. Edebi anlam ile konuşmacı niyeti arasındaki fark, dilsel yeterliliğin temel yönlerini aydınlatır. Nezaket teorisi ve yüz kurtarma mekanizmaları, sosyal hiyerarşilerin dilsel değişimleri nasıl nüfuz ettiğini göstermektedir.',
      word_count: 88,
      estimated_time_minutes: 5
    },
    {
      id: 'c1-3',
      level_id: 'c1',
      title: 'Economic Complexity',
      english_text: 'Heterodox economic theory challenges neoclassical orthodoxy by incorporating complexity theory and agent-based modeling. Behavioral economics demonstrates that rational actor assumptions fundamentally misrepresent human decision-making processes. Asymmetric information and principal-agent problems reveal systemic vulnerabilities in market mechanisms. Financialization and derivatives markets have exponentially complicated global economic interdependencies. Institutional economics emphasizes how regulatory frameworks and power structures shape economic outcomes fundamentally. Evolutionary approaches to economics conceptualize markets as dynamic systems exhibiting properties of complexity and emergence. The 2008 financial crisis exposed fundamental inadequacies in prevailing economic models and forecasting methodologies. Contemporary economic analysis requires integration of systems thinking and recognition of tipping points and cascade failures.',
      turkish_text: 'Heterodoks ekonomik teori, karmaşıklık teorisini ve ajan tabanlı modellemesini içererek neoklasik ortodoksilüğe meydan okumaktadır. Davranışsal ekonomika, rasyonel aktör varsayımlarının insan karar alma süreçlerini temel olarak yanlış temsil ettiğini göstermektedir. Asimetrik bilgi ve aktor-temsilci sorunları, pazar mekanizmalarında sistemik savunmasızlıkları ortaya çıkarmaktadır. Finansallaştırma ve türev piyasaları, küresel ekonomik karşılıklı bağımlılıkları üstel olarak karmaşıklaştırmıştır. Kurumsal ekonomika, düzenleyici çerçevelerin ve güç yapılarının ekonomik sonuçları temel olarak nasıl şekillendirdiğini vurgular.',
      word_count: 87,
      estimated_time_minutes: 5
    },
    {
      id: 'c1-4',
      level_id: 'c1',
      title: 'Neuroscience of Consciousness',
      english_text: 'The neural correlates of consciousness represent one of neuroscience\'s most formidable challenges, resisting reductive explanation. Integrated information theory proposes that consciousness arises from integrated information within neural networks. The hard problem of consciousness, articulated by Chalmers, questions whether physical processes can adequately explain subjective experience. Neuroimaging studies reveal remarkable neural synchronization patterns during conscious processing. The binding problem illuminates difficulties in understanding how distributed neural activity generates unified experience. Altered states induced by psychoactive substances reveal plasticity in consciousness generation mechanisms. Philosophical zombies and thought experiments expose conceptual difficulties in bridging the explanatory gap between physical processes and subjective phenomena. Contemporary neuroscience increasingly recognizes consciousness as multidimensional rather than unitary.',
      turkish_text: 'Bilinçin sinirsel korelatleri, sinirbilimin en ciddi zorlukları arasında yer almakta, redüktif açıklamaya direnmektedir. Entegre bilgi teorisi, bilinçin sinir ağları içindeki entegre bilgiden kaynaklandığını önerir. Chalmers tarafından belirtilen bilinçin zor problemi, fiziksel süreçlerin öznel deneyimi yeterince açıklayıp açıklayamayacağını sorgular. Nöroimaging çalışmaları, bilinçli işleme sırasında dikkate değer sinirsel senkronizasyon modellerini ortaya çıkarmaktadır. Bağlama sorunu, dağıtılmış sinirsel aktivitenin birleştirilmiş deneyimi nasıl ürettiğini anlamanın zorluklarını aydınlatmaktadır. Psikoaktif maddeler tarafından uyarılan değiştirilmiş durumlar, bilinç üretimi mekanizmalarında plastisite ortaya çıkarmaktadır.',
      word_count: 87,
      estimated_time_minutes: 5
    },
    {
      id: 'c1-5',
      level_id: 'c1',
      title: 'Political Theory',
      english_text: 'Post-structuralist political theory dismantles essentialist assumptions about power, identity, and governance. Foucault\'s genealogical analysis reveals how power circulates through disciplinary mechanisms beyond formal institutions. Butler\'s theorization of performative identity challenges biological determinism and essentialist categories. The concept of hegemony, advanced by Gramsci and refined by Laclau and Mouffe, elucidates ideological domination mechanisms. Agonistic pluralism reconceptualizes democratic contestation as fundamental rather than pathological. Postcolonial theory interrogates how historical imperialism continues structuring contemporary geopolitical relations. The bifurcation between universal principles and particularistic identities remains theoretically unresolved. Contemporary political analysis must navigate tensions between competing frameworks while avoiding both relativism and dogmatism.',
      turkish_text: 'Post-yapısalcı siyasal teori, güç, kimlik ve yönetişim hakkında özcü varsayımları söker. Foucault\'un genealojik analizi, güçün biçimsel kurumların ötesindeki disiplin mekanizmaları aracılığıyla nasıl dolaştığını ortaya çıkarmaktadır. Butler\'ın performatif kimlik teorisyonu, biyolojik determinizme ve özcü kategorilere meydan okumaktadır. Gramsci tarafından ileri sürülen ve Laclau ve Mouffe tarafından rafine edilen hegemonya konsepti, ideolojik hakim olma mekanizmalarını aydınlatır. Agonistik çoğulculuk, demokratik rekabeti patolojik yerine temel olarak yeniden kavramsallaştırmaktadır. Sömürgecilik sonrası teori, tarihsel emperyalizmin çağdaş jeopolitik ilişkileri nasıl yapılandırmaya devam ettiğini sorgular.',
      word_count: 85,
      estimated_time_minutes: 5
    },
    {
      id: 'c1-6',
      level_id: 'c1',
      title: 'Aesthetics Philosophy',
      english_text: 'Aesthetic philosophy interrogates the nature of beauty, artistic value, and subjective judgment. Kant\'s transcendental aesthetics grounds aesthetic judgment in universal conditions of human perception. Bourdieu\'s concept of cultural capital reveals how aesthetic preferences function as markers of social distinction. Adorno and Horkheimer\'s critique of the culture industry examines how mass production diminishes artistic authenticity. The dematerialization of art in the postmodern era challenges traditional object-based definitions. Digital aesthetics and algorithmic curation introduce novel questions regarding artistic agency and aesthetic authenticity. The tension between aesthetic universalism and cultural relativism remains philosophically contentious. Contemporary art increasingly interrogates the relationship between aesthetic experience and political engagement.',
      turkish_text: 'Estetik felsefe, güzellik doğası, sanatsal değer ve öznel hükmü sorgular. Kant\'ın transandental estetikleri, estetik hükmü insan algısının evrensel koşullarında temellendirir. Bourdieu\'ün kültürel sermaye konsepti, estetik tercihlerinin sosyal farklılaşmanın işaretleri olarak nasıl işlev gördüğünü ortaya çıkarmaktadır. Adorno ve Horkheimer\'ın kültür endüstrisinin kritiği, seri üretimin sanatsal özgünlüğü nasıl azalttığını incelemektedir. Postmodern çağda sanatın maddeleştirilmesi, geleneksel nesne temelli tanımları soruşturur. Dijital estetikler ve algoritmik kurasi, sanatsal ajans ve estetik özgünlük hakkında yeni soruları tanıtır.',
      word_count: 85,
      estimated_time_minutes: 5
    },
    {
      id: 'c1-7',
      level_id: 'c1',
      title: 'Environmental Ethics',
      english_text: 'Environmental ethics transcends anthropocentric frameworks by asserting the intrinsic value of non-human entities. Deep ecology advocates ecocentric worldviews that fundamentally challenge human exceptionalism. Biocentrism grants moral consideration to all sentient beings based on their capacity for suffering. Ecocentrism extends moral agency to ecosystems and ecological processes themselves. The precautionary principle advocates erring toward conservation when uncertainty characterizes potential environmental harm. Climate ethics grapples with intergenerational justice and the moral obligations of affluent nations toward climate-vulnerable populations. Environmental justice movements highlight how ecological degradation disproportionately impacts marginalized communities. Integrating environmental ethics into economic and political decision-making requires fundamental paradigm shifts.',
      turkish_text: 'Çevre etiği, insanüstü olmayan varlıkların içsel değerini ileri sürerek antroposentrik çerçeveleri aşmaktadır. Derin ekoloji, insan istisnasına temel olarak meydan okuyan ekosentrik dünya görüşlerini savunur. Biyosentrizm, tüm hisli varlıklara acı çekme kapasitelerine dayanarak ahlaksal dikkate ödeme yapar. Ekosentrizm, ahlaksal ajansı ekosistemlere ve ekolojik süreçlerin kendisine kadar genişletir. İhtiyat ilkesi, belirsizlik olası çevre hasarı nitelendiğinde korumaya doğru hata yapmayı savunur. İklim etiği, kuşaklar arası adalet ve varlıklı ülkelerin iklim açısından savunmasız nüfuslara yönelik ahlaksal yükümlülükleri ile mücadele ediyor.',
      word_count: 85,
      estimated_time_minutes: 5
    },
    {
      id: 'c1-8',
      level_id: 'c1',
      title: 'Cognitive Science',
      english_text: 'Cognitive science integrates insights from psychology, neuroscience, linguistics, and philosophy to elucidate mental processes. Connectionist models challenge classical cognitive architectures that posit discrete, rule-based representations. Embodied cognition theories situate mental processes within physical and environmental contexts fundamentally. Distributed cognition extends cognitive processes beyond individual minds to encompass collaborative and technological systems. The frame problem in artificial intelligence highlights difficulties in representing and updating contextual knowledge. Metacognition, the awareness of one\'s own cognitive processes, proves crucial for learning and error detection. Cognitive biases and heuristics reveal systematic deviations from rational decision-making models. Contemporary cognitive science increasingly recognizes the inseparability of cognition from emotion and social factors.',
      turkish_text: 'Bilişsel bilim, psikoloji, sinirbilim, dilbilim ve felsefeden gelen insights\'ları entegre ederek zihinsel süreçleri ortaya çıkarmaktadır. Koneksiyonist modeller, ayrık, kural tabanlı temsilleri varsayan klasik bilişsel mimarilere meydan okumaktadır. Somutlaştırılmış biliş teorileri, zihinsel süreçleri temel olarak fiziksel ve çevresel bağlamlara oturtmaktadır. Dağıtılmış biliş, bilişsel süreçleri işbirlikçi ve teknolojik sistemleri kapsayacak şekilde bireysel beyinlerin ötesine genişletir. Yapay zekada çerçeve sorunu, bağlamsal bilgiyi temsil etme ve güncelleme zorluklarını vurgular. Metabiliş, kişinin kendi bilişsel süreçleri hakkında farkındalık, öğrenme ve hata tespiti için çok önemlidir.',
      word_count: 85,
      estimated_time_minutes: 5
    },
    {
      id: 'c1-9',
      level_id: 'c1',
      title: 'Quantum Physics',
      english_text: 'Quantum mechanics fundamentally challenges classical intuitions regarding determinism and locality. The superposition principle permits quantum systems existing simultaneously in multiple states until measurement. Wave-particle duality demonstrates that quantum entities exhibit properties of both waves and particles. Entanglement exhibits non-local correlations that appear instantaneous across spatial distances. The measurement problem questions whether observation fundamentally alters quantum systems or merely reveals pre-existing properties. Quantum decoherence explains the emergence of classical behavior from quantum substrates. Interpretational frameworks including the Copenhagen interpretation and many-worlds hypothesis remain philosophically contentious. Quantum computing exploits superposition and entanglement for computational advantages unrealizable classically.',
      turkish_text: 'Kuantum mekaniği, determinizm ve yerellik hakkındaki klasik sezgilere temel olarak meydan okumaktadır. Süperpozisyon ilkesi, kuantum sistemlerinin ölçüme kadar aynı anda çoklu durumda bulunmasını sağlar. Dalga-parçacık dualitesi, kuantum varlıklarının hem dalgaların hem parçacıkların özelliklerini sergilediğini göstermektedir. Dolaşıklık, mekansal mesafeler arasında anlık görünen yerel olmayan korelasyonlar sergiler. Ölçüm sorunu, gözlemlemenin kuantum sistemlerini temel olarak değiştirip değiştirmediğini ya da önceden varolan özellikleri ortaya çıkarıp çıkarmadığını soruşturur. Kuantum dekoerans, klasik davranışın kuantum substratından ortaya çıkışını açıklar. Kopenhag yorumu ve birçok-dünyalar hipotezi dahil yorumsal çerçeveler felsefi olarak tartışmalı kalmaya devam ediyor.',
      word_count: 85,
      estimated_time_minutes: 5
    },
    {
      id: 'c1-10',
      level_id: 'c1',
      title: 'Literary Theory',
      english_text: 'Literary theory examines how texts generate meaning through linguistic, narrative, and ideological structures. Structuralism decodes texts as systems of signs operating according to underlying linguistic rules. Deconstruction, pioneered by Derrida, interrogates how texts contain internal contradictions undermining determinate meaning. Psychoanalytic criticism reveals how unconscious desires and repressed content structure narrative and character. Marxist criticism exposes how literature reflects and reinforces ideological systems sustaining class hierarchies. Feminist theory examines how patriarchal structures permeate literary representation and authorial voice. Postcolonial criticism interrogates how colonial narratives persist in contemporary literature and representation. New historicism contextualizes texts within specific power relations and material conditions. Contemporary literary analysis increasingly incorporates intertextuality and the plurality of interpretive communities.',
      turkish_text: 'Edebi teori, metinlerin dilsel, anlatısal ve ideolojik yapılar aracılığıyla anlamı nasıl ürettiğini inceler. Yapısalcılık, metinleri temel dilsel kurallara göre işleyen gösterilerin sistemleri olarak kodunu çözer. Derrida tarafından öncülüğü yapılan yapısallık-karşıtı, metinlerin belirli anlam altını oyma iç çelişkiler nasıl içerdiğini soruşturur. Psikolojik analitik eleştirisi, bilinçsiz arzuların ve bastırılan içeriğin anlatı ve karakteri nasıl yapılandırıp yapılandırdığını ortaya çıkarmaktadır. Marksist eleştiri, edebiyatın sınıf hiyerarşilerini sürdüren ideolojik sistemleri nasıl yansıttığını ve güçlendirdiğini ortaya çıkarmaktadır. Feminist teori, ataerkil yapıların edebi temsil ve yazarlık sesine nasıl nüfuz ettiğini inceler.',
      word_count: 85,
      estimated_time_minutes: 5
    },
    {
      id: 'c1-11',
      level_id: 'c1',
      title: 'Sociology of Knowledge',
      english_text: 'The sociology of knowledge interrogates how social structures shape what constitutes valid knowledge. Kuhn\'s paradigm theory demonstrates how scientific revolutions represent fundamental shifts in conceptual frameworks. Merton\'s analysis reveals how institutional incentives shape research priorities and publishing practices. Latour\'s actor-network theory challenges the distinction between human and non-human actors in knowledge production. The social construction of reality, as articulated by Berger and Luckmann, demonstrates how meaning emerges through social interaction. Standpoint epistemology argues that knowledge is situated and perspectives from marginalized groups offer critical insights. The science wars controversy revealed fundamental tensions between realist and social constructivist epistemologies. Contemporary sociology of science increasingly recognizes reflexivity and the challenges of objectivity claims.',
      turkish_text: 'Bilgi sosyolojisi, sosyal yapıların geçerli bilgiyi neyin oluşturduğunu nasıl şekillendirdiğini soruşturur. Kuhn\'ın paradigma teorisi, bilimsel devrimlerin kavramsal çerçevelerde temel değişimleri nasıl temsil ettiğini göstermektedir. Merton\'ın analizi, kurumsal teşviklerin araştırma önceliklerini ve yayınlama uygulamalarını nasıl şekillendirdiğini ortaya çıkarmaktadır. Latour\'ın aktör-ağ teorisi, bilgi üretiminde insan ve insan olmayan aktörler arasındaki ayrımı soruşturur. Berger ve Luckmann tarafından belirtilen gerçekliğin sosyal yapısı, anlamın sosyal etkileşim aracılığıyla nasıl ortaya çıktığını göstermektedir. Duruşsal epistemoloji, bilginin konumlanmış olduğu ve marjinalleştirilmiş gruplardan perspektifler kritik içgörüler sunduğu savunur.',
      word_count: 85,
      estimated_time_minutes: 5
    },
    {
      id: 'c1-12',
      level_id: 'c1',
      title: 'Bioethics',
      english_text: 'Bioethics addresses moral dilemmas emerging from biological and medical advancement. Principle-based approaches balance autonomy, beneficence, non-maleficence, and justice in medical decision-making. Genetic engineering raises profound questions regarding enhancement, eugenics, and the modification of human heredity. End-of-life ethics grapples with euthanasia, physician-assisted suicide, and the determination of death. Reproductive ethics interrogates access to reproductive technologies and the moral status of embryos. Research ethics examines informed consent, risk-benefit assessment, and justice in subject selection. The concept of human dignity, while rhetorically potent, remains philosophically elusive. Emerging technologies including gene editing and artificial gestation create unprecedented ethical challenges.',
      turkish_text: 'Biyoetik, biyolojik ve tıbbi ilerleme aracılığıyla ortaya çıkan ahlaksal ikilemler ele alır. Prensip temelli yaklaşımlar, tıbbi karar almada özerklik, yararlanabilirlik, zarar vermeme ve adalet dengesini kurar. Genetik mühendislik, geliştirme, ırkçılık ve insan kalıtımının değiştirilmesi ile ilgili derin soruları gündeme getirir. Yaşam sonu etiği, ötenazi, doktor yardımıyla intihar ve ölümün belirlenmesi ile mücadele ediyor. Üretken etik, üretken teknolojilere erişim ve embriyoların ahlaksal durumunu soruşturur. Araştırma etiği, bilgili onay, risk-fayda değerlendirmesi ve konu seçiminde adalet incelemektedir. İnsan onuru konsepti, retoryal olarak güçlü olmakla birlikte, felsefi olarak kaçak kalmaya devam ediyor.',
      word_count: 85,
      estimated_time_minutes: 5
    },
    {
      id: 'c1-13',
      level_id: 'c1',
      title: 'Historical Ontology',
      english_text: 'Historical ontology, as developed by Ian Hacking, examines how historical processes shape what categories of people and phenomena exist. Homosexuality as a modern identity category emerged through medical, legal, and social discourses rather than existing eternally. The social construction of race reveals how hierarchical classifications become naturalized despite their contingent historical origins. Multiple realizability in philosophy of mind demonstrates how mental states are not reducible to universal physical substrates. Genealogical analysis deconstructs essentialist identity categories by tracing their contingent historical emergence. The notion that our fundamental categories result from historical contingency rather than metaphysical necessity fundamentally challenges realist assumptions. Contemporary historical ontology extends these insights to technological systems and digital identities. The question of what categories are real requires examining their historical instantiation and ongoing material effects.',
      turkish_text: 'Ian Hacking tarafından geliştirilen tarihsel ontoloji, tarihsel süreçlerin insan kategorileri ve olguları nasıl var kıldığını inceler. Eşcinsellik, modern bir kimlik kategorisi olarak, tıbbi, yasal ve sosyal söylemler aracılığıyla ortaya çıktı, ebedi olarak var olmadığında. Irk sosyal yapısı, hiyerarşik sınıflandırmaların beklenmedik tarihsel kökenlerine rağmen nasıl doğallaştığını ortaya çıkarmaktadır. Zihin felsefesinde çoklu gerçekleştirebilirlik, zihinsel durumların evrensel fiziksel substratlar için indirgenemez olmadığını göstermektedir. Genealojik analiz, özcü kimlik kategorilerini onların beklenmedik tarihsel ortaya çıkışını takip ederek söker.',
      word_count: 85,
      estimated_time_minutes: 5
    },
    {
      id: 'c1-14',
      level_id: 'c1',
      title: 'Computational Theory',
      english_text: 'Computability theory explores the mathematical limits of what machines can compute and what problems remain algorithmically unsolvable. Turing completeness establishes universal standards for computational capability across different computational systems. The halting problem, proven undecidable, demonstrates that certain questions about program behavior resist algorithmic solution. Computational complexity examines the resource requirements for solving problems as input size scales. P versus NP remains perhaps the most significant unsolved problem in theoretical computer science. Oracle machines and relative computability extend the theory to encompass computational powers beyond Turing machines. Post-Turing computation explores hypercomputation and quantum computing as potential extensions of classical computability. The physical Church-Turing thesis questions whether computational power is fundamentally limited by physical law.',
      turkish_text: 'Hesaplanabilirlik teorisi, makinelerin hesaplayabileceği şeylerin matematiksel sınırlarını ve algoritmikman çözülmeyen problemlerin kalmasını keşfeder. Turing tamamlığı, farklı hesaplayıcı sistemler arasında hesaplayıcı yeteneği için evrensel standartları belirler. Halting problemi, karar verilemez olarak kanıtlanmış, program davranışı hakkında belirli soruların algoritmikman çözüme direnmesini göstermektedir. Hesaplayıcı karmaşıklık, giriş boyutu ölçeklendikçe problemleri çözmek için kaynak gereksinimlerini inceler. P versus NP, teorik bilgisayar biliminde belki de en önemli çözülmemiş problemi olmaya devam ediyor. Oracle makineler ve göreceli hesaplanabilirlik, teoriyi Turing makinelerinin ötesindeki hesaplayıcı güçleri kapsayacak şekilde genişletir.',
      word_count: 85,
      estimated_time_minutes: 5
    },
    {
      id: 'c1-15',
      level_id: 'c1',
      title: 'Epistemology of Mathematics',
      english_text: 'The epistemology of mathematics interrogates whether mathematical truths represent discoveries of pre-existing abstract objects or human constructions. Platonism posits that mathematical objects exist independently in an abstract realm accessed through intuition. Intuitionism rejects the law of excluded middle, restricting mathematics to constructible operations and rejecting infinitary principles. Formalism treats mathematics as a rule-governed manipulation of symbols without reference to external meaning. Structuralism in mathematics shifts focus from mathematical objects to the structures they instantiate. Indispensability arguments contend that mathematics\'s essential role in physical theorizing provides evidence for mathematical ontology. The axiom of choice and continuum hypothesis remain undecidable within standard set theory, illuminating mathematics\'s foundational limitations. Contemporary debates regarding constructive mathematics versus classical mathematics reflect persistent disagreements about mathematical foundations.',
      turkish_text: 'Matematik epistemolojisi, matematiksel gerçeklerin önceden var olan soyut nesnelerin keşiflerini mi yoksa insan yapılarını mı temsil ettiğini soruşturur. Platonizm, matematiksel nesnelerin sezgi aracılığıyla erişilen soyut bir alanda bağımsız olarak var olduğunu varsayar. Sezgisellik, dışlanmış ortayı reddet ederek matematiği inşa edilebilir operasyonlarla sınırlar ve sonsuz ilkeleri reddeder. Biçimcilik, matematiği dış anlama referans olmaksızın kural tarafından yönetilen sembol manipülasyonu olarak ele alır. Matematikte yapısalcılık, matematiksel nesnelerden onların somutlaştırıp oldukları yapılara odaklanmayı değiştirir. Vazgeçilmezlik argümanları, fiziğin teoriyi matematikteki matematiğin matematiksel ontoloji için kanıt sağladığını savunur. Seçim aksiyomu ve kontinuum hipotezi, standart küme teorisi içinde karar verilemez kalmaya devam ediyor, matematiğin temel sınırlamalarını aydınlatmaktadır.',
      word_count: 85,
      estimated_time_minutes: 5
    },
    {
      id: 'c1-16',
      level_id: 'c1',
      title: 'Phenomenology of Technology',
      english_text: 'The phenomenology of technology examines how technological artifacts mediate human experience and constitute our lifeworlds. Heidegger\'s concept of technology as enframing reveals how technological thinking instrumentalizes nature and obscures being itself. Embodied interaction with technological systems demonstrates how tools become transparent extensions of bodily intentionality. The phenomenological analysis of digital technologies reveals how virtuality and presence become ambiguous in mediated environments. Technological mediation fundamentally reshapes temporal, spatial, and social dimensions of human existence. Augmented and virtual reality technologies challenge traditional distinctions between reality and representation. The question of technological agency remains philosophically contentious regarding the ontological status of digital beings. Contemporary phenomenological investigation must address how algorithmic systems structure pre-reflective experience and perception.',
      turkish_text: 'Teknoloji fenomenolojisi, teknolojik eserlerin insan deneyimini nasıl aracılığını yaptığını ve yaşam dünyalarını nasıl oluşturduğunu inceler. Heidegger\'ın teknolojiyi çerçeveleme kavramı, teknolojik düşüncenin doğayı nasıl enstrümantal hale getirdiğini ve varlığın kendisini nasıl gizlediğini ortaya çıkarmaktadır. Teknolojik sistemlerle somutlaştırılmış etkileşim, araçların bedensel niyetlilik uzantıları haline nasıl geldiğini göstermektedir. Dijital teknoloji\'nin fenomenolojik analizi, sanal ortamda nasıl sanal ve bulunmanın muğlak hale geldiğini ortaya çıkarmaktadır. Teknolojik aracılık, insan varlığının zamansal, mekansal ve sosyal boyutlarını temel olarak yeniden şekillendirmektedir. Artırılmış ve sanal gerçeklik teknolojileri, gerçeklik ve temsil arasında geleneksel ayrımları soruşturur.',
      word_count: 85,
      estimated_time_minutes: 5
    },
    {
      id: 'c1-17',
      level_id: 'c1',
      title: 'Evolutionary Psychology',
      english_text: 'Evolutionary psychology applies Darwinian principles to explain psychological mechanisms as adaptations to ancestral environments. Sexual selection theory illuminates the evolution of seemingly maladaptive psychological traits and preferences. Domain-specificity argues that psychological mechanisms evolved to solve specific adaptive problems rather than comprising general-purpose cognition. The evolution of language remains theoretically contentious regarding its adaptive origins and continuity with animal communication. Cooperation and altruism present evolutionary puzzles regarding how natural selection could favor seemingly self-sacrificial behavior. The modularity thesis proposes psychological functions decompose into functionally specialized systems optimized through selection. Evolutionary mismatch theory explains contemporary psychological pathologies as adaptations to ancestral contexts misaligned with modern environments. Critiques challenge evolutionary psychology\'s adaptionist assumptions and its tendency toward unfalsifiable explanations.',
      turkish_text: 'Evrimsel psikoloji, psikolojik mekanizmaları atasal ortamların uyumlaması olarak açıklamak için Darwinci ilkeler uygular. Cinsel seçim teorisi, görünüşte uyumsuz psikolojik özelliklerin ve tercihlerin evrimini aydınlatmaktadır. Alan özgüllüğü, psikolojik mekanizmaların genel amaçlı biliş kapsamak yerine belirli uyum sorunlarını çözmek için evrimleştiğini savunur. Dilin evrimi, uyum kökenlerine ve hayvan iletişimi ile sürekliliğine ilişkin teorik olarak tartışmalı kalmaya devam ediyor. İşbirliği ve fedakarlık, doğal seçimin görünüşte kendini feda edici davranışı nasıl tercih edebileceğini ilişkin evrimsel bulmacalar sunmuştur. Modülarite tezi, psikolojik işlevlerin seçim aracılığıyla optimize edilen işlevsel olarak uzmanlaşmış sistemlere ayrışıp ayrışmadığını önerir.',
      word_count: 85,
      estimated_time_minutes: 5
    },
    {
      id: 'c1-18',
      level_id: 'c1',
      title: 'Metaphysics',
      english_text: 'Metaphysics investigates fundamental questions regarding the nature of reality and existence. The ontological status of abstract objects remains contested between nominalism denying their existence and realism affirming it. Substance metaphysics posits enduring entities possessing properties, contrasting with process metaphysics emphasizing becoming. The mind-body problem interrogates how consciousness relates to physical processes without reducing one to the other. Possible worlds semantics employs counterfactual scenarios to analyze modality, necessity, and possibility. Trope theory challenges substance-attribute distinctions by proposing particular qualities as fundamental ontological units. Presentism asserts only the present exists, rejecting eternalism that grants equal reality to past and future. The nature of causation remains philosophically disputed regarding efficient causes, agent causation, and event causation frameworks.',
      turkish_text: 'Metafizik, gerçekliğin doğası ve varlığı ilişkin temel soruları araştırmaktadır. Soyut nesnelerin ontolojik durumu, varoluşlarını reddetmiş nominalizm ile var olduğunu ileri süren realizm arasında tartışmalı olmaya devam ediyor. Madde metafiziği, özellik taşıyan kalıcı varlıkları varsayarak, olmaya vurgu yapan süreç metafiziksi ile çelişir. Zihin-vücut sorunu, biliş nasıl fiziksel süreçler ile biri diğerine indirgemeye kadar ilişkilidir soruşturur. Olası dünyalar anlamı, kipliği, gerekliliği ve olasılığı analiz etmek için varsayımsal senaryoları istihdam ediyor. Trope teorisi, belirli nitelikleri temel ontolojik birimler olarak önerek madde-özellik ayrımlarına meydan okumaktadır. Presentizm, sadece mevcut varolanın, geçmiş ve geleceğe eşit gerçeklik veren ebediyetçiliği reddederken var olduğunu ileri sürer.',
      word_count: 85,
      estimated_time_minutes: 5
    },
    {
      id: 'c1-19',
      level_id: 'c1',
      title: 'Semiotics',
      english_text: 'Semiotics investigates the nature of signs and the process of signification within meaning-making systems. Peirce\'s triadic model distinguishes signs into icons, indices, and symbols based on their relationship to referents. Saussure\'s dyadic conception separates signifiers and signifieds, emphasizing the arbitrary nature of linguistic signs. Umberto Eco\'s semiotics extends analysis to reveal codes and conventions underlying cultural phenomena. The concept of unlimited semiosis suggests meaning perpetually defers within chains of signification. Semiotics illuminates how advertisements, images, and narratives construct meaning through deployment of iconic, indexical, and symbolic registers. Multimodal semiotics addresses how combinations of linguistic, visual, and sonic elements generate composite meanings. Biosemiotics extends semiotic analysis to living systems, challenging language-centered approaches.',
      turkish_text: 'Göstergebilim, anlam yapma sistemleri içinde işaretlerin doğasını ve gösterim sürecini araştırmaktadır. Peirce\'nin üçlü modeli, işaretleri referentler ile ilişkilerine dayanarak simgelere, endekslere ve simgelere ayırır. Saussure\'ün ikili kavramsallaştırması, gösterenler ve gösterilenler ayırmaktadır, dilsel işaretlerin keyfi doğasını vurgulayarak. Umberto Eco\'nun göstergebilimi, kültürel olguları altında yatan kodlar ve sözleşmeleri ortaya çıkarmak için analizi genişletir. Sınırsız gösterim kavramı, anlamın gösterim zinciri içinde sürekli olarak erktelediğini önerir. Göstergebilim, reklamların, görüntülerin ve anlatıların ikonik, indeksel ve sembolik kaydı nasıl oluşturduğunu aydınlatır. Multimodal göstergebilim, dilsel, görsel ve sonik öğelerin kombinasyonlarının bileşik anlamları nasıl oluşturduğunu ele alır.',
      word_count: 85,
      estimated_time_minutes: 5
    },
    {
      id: 'c1-20',
      level_id: 'c1',
      title: 'Phenomenology and Time',
      english_text: 'Phenomenology of temporality interrogates how consciousness constitutes temporal experience transcending mere chronological succession. Husserl\'s analysis of internal time-consciousness reveals retention and protention as fundamental structures preceding reflective awareness. Heidegger\'s existential analytics demonstrates how temporality constitutes the fundamental structure of human Being itself. The distinction between objective time and lived temporal experience illuminates the phenomenological dimensions of duration and temporal flow. Anticipatory consciousness and temporal depth demonstrate how human existence transcends the presentist now. Memory and expectation reshape present experience, challenging traditional philosophical emphasis on punctiform moments. Temporal experience exhibits asymmetries regarding the cognitive accessibility of past versus future. Contemporary phenomenology investigates how digital technologies transform temporal experience and the constitution of historical consciousness.',
      turkish_text: 'Zamansallığın fenomenolojisi, biliş yalnızca kronolojik ardışıklığı aşan zamansal deneyimi nasıl oluşturduğunu soruşturur. Husserl\'ün iç zaman bilinci analizi, reflektif farkındalık öncesinde temel yapılar olarak elde tutmayı ve protansiyon ortaya çıkarmaktadır. Heidegger\'ın varoluşsal analitikleri, zamansallığın insan Varlığının kendisinin temel yapısını nasıl oluşturduğunu göstermektedir. Objektif zaman ve yaşanan zamansal deneyim arasındaki ayrım, süre ve zamansal akışın fenomenolojik boyutlarını aydınlatır. Beklenti bilinci ve zamansal derinlik, insan varlığının mevcut anı nasıl aştığını göstermektedir. Bellek ve beklenti, mevcut deneyimi yeniden şekillendirmekte, geleneksel felsefenin nokta anlamda vurgusu sorgularını sorgular. Zamansal deneyim, geçmiş ve gelecek bilişsel erişilebilirliğine ilişkin asimetri sergiler.',
      word_count: 85,
      estimated_time_minutes: 5
    }
  ],
  'C2': [
    {
      id: 'c2-1',
      level_id: 'c2',
      title: 'Transcendental Idealism',
      english_text: 'Kantian transcendental idealism fundamentally reconstitutes epistemological inquiry by establishing synthetic a priori knowledge as the condition for experience\'s possibility. The critical philosophy distinguishes rigorously between phenomena and noumena, asserting that cognitive access remains circumscribed within the phenomenal realm. Kant\'s Copernican Revolution inverts epistemological presuppositions, arguing that objects must conform to our cognitive capacities rather than cognition conforming to objects. The transcendental unity of apperception serves as the fundamental unifying condition enabling the synthesis of representations into coherent experience. Space and time emerge not as metaphysically independent substances but as transcendental forms of intuition constitutive of human sensibility. Categories of understanding function as a priori conditions structuring phenomenal experience and rendering cognizable the manifold of sensation. Transcendental idealism rigorously maintains the distinction between the empirical and transcendental perspectives while elucidating their necessary interdependence. Contemporary philosophical discourse continues grappling with the viability of reconciling Kantian transcendentalism with modern scientific understanding.',
      turkish_text: 'Kantian transandental idealizm, sentetik a priori bilgisini deneyimin olasılığının şartı olarak kurarak epistemolojik araştırmayı temel olarak yeniden kurar. Kritik felsefe fenomen ve noumen arasında katı bir şekilde ayırım yaparken, bilişsel erişimin fenomenal alanda sınırlandığını ileri sürer. Kant\'ın Kopernik Devrimi epistemolojik varsayımları çevirerek, nesnelerin bilişsel kapasitelerimize uyması gerektiğini savunmaktadır. Temsilin sentezini tutarlı deneyime birleştirmeyi sağlamayan temel birleştirme koşulu olarak temsil\'in transandental birliği hareket eder. Uzay ve zaman, metafizik olarak bağımsız madde değil, insan duyarlılığını kuran transandental sezgi türleri olarak ortaya çıkmaktadır.',
      word_count: 92,
      estimated_time_minutes: 5
    },
    {
      id: 'c2-2',
      level_id: 'c2',
      title: 'Post-Structural Deconstruction',
      english_text: 'Derridean deconstruction radically destabilizes logocentrism and phonocentrism pervading Western metaphysics\'s entire history. Differance operates as a neologistic concept denoting the simultaneous operations of difference and deferral constituting meaning\'s impossibility of presence. The trace inscribes alterity irreducibly within identity, precluding the establishment of self-present meaning. Deconstruction\'s rigorous textual analysis reveals how texts necessarily harbor internal contradictions undermining their explicit ideological commitments. The supplement concept demonstrates how apparently marginal elements paradoxically sustain the text\'s apparent coherence. Hauntology designates how the specter of what has been excluded persistently disrupts presence\'s claimed immediacy. Deconstruction rigorously avoids reduction to nihilism or relativism while refusing recuperation into systematic philosophical frameworks. Contemporary critique extends deconstructive strategies to interrogate institutional structures, legal frameworks, and ostensibly transparent identity categories.',
      turkish_text: 'Derridean yapısallık-karşıtlığı, logos merkeziyetçiliğini ve Batı metafiziğinin tarihini kaplayan sesçiliği radikal bir şekilde istikrarsızlaştırmaktadır. Differance, farkı ve ertelemeyi çağırarak anlamın mevcudiyetinin imkansızlığını oluşturan neolojik bir kavram olarak işlev görmektedir. İz, kimlik içinde alteriteyi indirgenmiş bir şekilde yazarak, kendi sunulan anlamın kuruluşunu önlemektedir. Yapısallık karşıtlığının titiz metinsel analizi, metinlerin açık ideolojik taahhütlerini altını oyma iç çelişkiler nasıl barındırdığını ortaya çıkarmaktadır. Ek kavramı, görünüşte marjinal öğelerin paradoksal olarak metnin görünen tutarlılığını nasıl sürdürdüğünü göstermektedir. Hauntoloji, dışlanmış olanın hayaletinin mevcudiyetin iddia edilen doğrudan iyimarlık nasıl saboten ettiğini tanımlamaktadır.',
      word_count: 92,
      estimated_time_minutes: 5
    },
    {
      id: 'c2-3',
      level_id: 'c2',
      title: 'Structural Linguistics',
      english_text: 'Saussure\'s foundational dichotomies revolutionize linguistic inquiry by establishing the sign\'s bipartite structure comprising signifier and signified, whose relationship proves arbitrary rather than motivated. Synchronic analysis privileging langue over parole enables examination of the language system\'s formal structures independent of individual utterances. The value system demonstrates that linguistic meaning emerges not from inherent properties but from differential relationships within the system. Structural linguistics extends beyond phonology and morphology to encompass syntax\'s systematic properties. Jakobson\'s distinctive feature analysis reveals how phonological contrasts decompose into binary oppositions. Generative approaches, subsequently developed by Chomsky, propose innate grammatical structures and transformational rules. Structuralism\'s systematic methodology proves applicability across semiotic domains beyond language. Contemporary linguistics acknowledges structuralism\'s contributions while addressing its inadequacies regarding pragmatic meaning-making and contextual variation.',
      turkish_text: 'Saussure\'ün temel dikotomileri, gösterenden ve gösterilenden oluşan gösterinin iki parçalı yapısını kurarak ve bunların ilişkisinin keyfi olduğunu göstererek dilbilimsel araştırmayı devrim yoluyla getirir. Parole üzerinde langue\'yi tercih eden senkronik analiz, bireysel ifadelerden bağımsız dil sisteminin biçimsel yapılarının incelenmesini sağlar. Değer sistemi, dilbilimsel anlamın sisteme yönelik fark ilişkisinden ortaya çıktığını göstermektedir. Yapısal dilbilim, fonotoloji ve morfoloji ötesine sentaksının sistematik özelliklerini kapsayacak şekilde genişlemektedir. Jakobson\'ın belirgin özellik analizi, fonetik zıtlaşmanın nasıl ikili zıtlaşmalara ayrıştığını göstermektedir. Üretken yaklaşımlar, sonradan Chomsky tarafından geliştirilen, doğuştan dilbilgisi yapıları ve dönüşüm kuralları önerir.',
      word_count: 92,
      estimated_time_minutes: 5
    },
    {
      id: 'c2-4',
      level_id: 'c2',
      title: 'Dialectical Materialism',
      english_text: 'Marxist dialectical materialism fundamentally reconceptualizes history as driven by material contradictions within modes of production rather than ideational forces. Historical materialism argues that economic base determinatively structures ideological superstructure, though subsequent Marxist theorists acknowledge complex mediation. The labour theory of value explains commodity exchange through socially necessary labour time expended, revealing capitalism\'s exploitative mechanisms. Capital\'s relentless accumulation imperatives necessitate perpetual expansion, eventually exhausting profitable investment outlets. Class struggle constitutes history\'s motive force, with revolutionary transformation emerging from internal contradictions capitalism cannot resolve. Gramsci\'s modifications introduce hegemony as cultural-ideological domination preceding direct coercion. Later Western Marxists problematize economistic reductionism while maintaining dialectical materialism\'s analytical apparatus. Contemporary Marxist scholarship interrogates historical materialism\'s viability within post-industrial knowledge economies.',
      turkish_text: 'Marksist diyalektik materyalizm, tarihi fikirsel güçler yerine üretim tarzları içindeki maddi çelişkilerle sürülen olarak temel olarak yeniden kavramsallaştırmaktadır. Tarihsel materyalizm, ekonomik tabanın ideolojik üst yapıyı belirleyici yapılandırdığını savunur, ancak sonraki Marksist teorisyenler karmaşık arabuluculuk kabul etmektedir. Emek değeri teorisi, emtia değişimini harcanan sosyal gerekli emek zamanı aracılığıyla açıklayarak, kapitalizmin sömürü mekanizmalarını ortaya çıkarmaktadır. Sermayenin iç karışık birikim zaruriyetleri, kârlı yatırım çıkışlarını tüketen kalıcı genişleme gerektirmektedir. Sınıf mücadelesi tarihin motif gücünü oluşturur, kapitalizmin çözemeyeceği iç çelişkilerden devrimci dönüşüm ortaya çıkmaktadır.',
      word_count: 92,
      estimated_time_minutes: 5
    },
    {
      id: 'c2-5',
      level_id: 'c2',
      title: 'Phenomenological Hermeneutics',
      english_text: 'Gadamer\'s fusion of horizons fundamentally reconstitutes hermeneutic understanding as dialogical encounter transcending subject-object dichotomies inherent in traditional epistemology. The hermeneutic circle\'s iterative structure demonstrates how interpretive understanding emerges through prejudgments\' continuous interrogation. Horizons represent historically situated interpretive perspectives, and understanding requires their productive fusion. Effective history reveals how texts bear upon interpreters despite temporal distance, precluding innocence regarding tradition\'s constraints. The universal structure of hermeneutics asserts that all understanding necessarily involves linguistic mediation and contextual embeddedness. Truth emerges not from methodological correctness but from genuine dialogue\'s happening. Hermeneutic rationality resists both relativism denying objective constraints and naive realism ignoring interpretive situatedness. Contemporary philosophical hermeneutics addresses how digital media and algorithmic mediation transform the hermeneutic situation fundamentally.',
      turkish_text: 'Gadamer\'ın ufukların füzyonu, hermenötik anlayışı geleneksel epistemolojide bulunan özne-nesne dikotomilerini aşan diyalojik karşılaşma olarak temel olarak yeniden kurar. Hermenötik dairenin iteratif yapısı, önyargıların sürekli sorgulanması aracılığıyla yorumlanmış anlayışın nasıl ortaya çıktığını göstermektedir. Ufuklar tarihsel olarak konumlandırılmış yorumlanmış perspektifler temsil etmekte, ve anlayış onların üretken füzyonunu gerektirir. Etkili tarih, metinlerin zamansal mesafeye rağmen yorumcuları nasıl yükeltiğini ortaya çıkarmakta, geleneğin kısıtlamalarına ilişkin masumiyet önlemektedir. Hermenötiklerin evrensel yapısı, tüm anlayışın gerekli olarak dilsel aracılığı ve bağlamsal gömülü oluşu içerdiğini ileri sürer. Gerçek metodolojik doğruluk değil, gerçek diyaloğun olayından ortaya çıkmaktadır.',
      word_count: 92,
      estimated_time_minutes: 5
    },
    {
      id: 'c2-6',
      level_id: 'c2',
      title: 'Postcolonial Historiography',
      english_text: 'Postcolonial scholarship fundamentally challenges Western historiography\'s universalist pretensions by revealing how colonial perspectives became naturalized as objective truth. Edward Said\'s Orientalism demonstrates how the Orient emerged as a discursive construction enabling Western domination through knowledge production. Spivak\'s critique of subalternity interrogates how subaltern voices remain irreducibly silenced by the structures through which they might represent themselves. Bhabha\'s concepts of hybridity and mimicry reveal how colonial subjects appropriate colonizers\' discourses in unexpected ways. Decoloniality extends beyond historiographic revision to reconstitute epistemic frameworks rejecting European modernity\'s universalist claims. Indigenous knowledges and cosmologies reclaim validity against colonial epistemicide\'s ongoing effects. Postcolonial temporality challenges linear progress narratives imposing Western developmental models. Contemporary postcolonial theory interrogates how colonial legacies persist within ostensibly postcolonial institutions and global power structures.',
      turkish_text: 'Sömürgecilik sonrası bilimleri, Batı historiografyasının evrenselci iddialarını temel olarak soruşturmakta, kolonyal perspektiflerin nesnel gerçek olarak nasıl doğallaştırıldığını ortaya çıkarmaktadır. Edward Said\'ın Oryantalizmi, Doğunun Batı egemenliğini bilgi üretimi aracılığıyla sağlayan bir söylemsel yapı olarak nasıl ortaya çıktığını göstermektedir. Spivak\'ın subaltern kritiği, subaltern seslerinin kendilerini temsil edebilecekleri yapılar tarafından nasıl indirgenememiş bir şekilde sessiz kaldığını soruşturur. Bhabha\'nın hibridite ve taklit kavramları, sömürge konularının sömürgecilerin söylemlerini beklenmedik yollarla nasıl uyarladığını ortaya çıkarmaktadır. Sömürgecilik-karşıtlığı historiografik revizyon ötesine, Avrupa modernliğinin evrenselci iddialarını reddeden epistemik çerçeveleri yeniden kurmaktadır.',
      word_count: 92,
      estimated_time_minutes: 5
    },
    {
      id: 'c2-7',
      level_id: 'c2',
      title: 'Epistemological Naturalism',
      english_text: 'Naturalistic epistemology reconstitutes traditional epistemology by asserting that justified belief emerges from natural cognitive processes rather than transcendental conditions. Reliabilism argues that justified belief requires beliefs\' production through reliable mechanisms, making belief-formation truth-conducive. Goldman\'s process reliabilism specifies that justification depends upon cognitive processes\' actual reliability producing true beliefs. Evolutionary epistemology claims that cognitive mechanisms themselves are products of natural selection optimizing truth-tracking. The naturalistic rejection of the given challenges foundationalist epistemologies presupposing self-evident starting points. Naturalized semantics explain how intentionality and representational content arise from natural causal relationships rather than transcendental meaningfulness. Pragmatist epistemology emphasizes successful action and adaptive problem-solving as criteria for knowledge. Contemporary naturalistic epistemology addresses limitations of purely causal reliabilist accounts while maintaining naturalism\'s methodological commitments.',
      turkish_text: 'Naturalistik epistemoloji, haklı inanç doğal bilişsel süreçlerinden ortaya çıktığını ileri sürerek geleneksel epistemoloji yeniden kurmaktadır. Güvenilircilik, haklı inanç, inançları güvenilir mekanizmalar aracılığıyla ortaya çıkarmayı gerektirdiğini savunmakta, inanç oluşumunu doğru davranışlı kılmaktadır. Goldman\'ın süreç güvenilirliği, haklılaşmanın doğru inançlar üreten bilişsel süreçlerin gerçek güvenilirliğine bağlı olduğunu belirtmektedir. Evrimsel epistemoloji, bilişsel mekanizmaların kendilerinin gerçeği takip etme yapabilecek doğal seçimin ürünleri olduğunu iddia etmektedir. Verinin naturalistik reddi, foundacionalistik epistemoloji önceden kendini belli başlangıç noktalarını varsayan, soruşturulmaktadır. Naturalize edilmiş anlambilim, kasıtlılığın ve temsili içeriğin transandental anlam yerine doğal nedensel ilişkilerden nasıl ortaya çıktığını açıklamaktadır.',
      word_count: 92,
      estimated_time_minutes: 5
    },
    {
      id: 'c2-8',
      level_id: 'c2',
      title: 'Process Philosophy',
      english_text: 'Whitehead\'s process philosophy fundamentally reconstitutes metaphysics by privileging becoming over being, event over substance. Actual occasions constitute reality\'s fundamental units, comprehending experience and agency at fundamental ontological levels. The process of concrescence describes how actual occasions synthesize multiple prehensions into determinate actualities. Dipolar divinity possesses both necessary and contingent aspects, resolving traditional theodicy problems threatening monotheistic coherence. Creativity operates as the ultimate metaphysical principle, precluding deterministic closure and enabling novelty\'s perpetual emergence. The rejection of substance metaphysics and atomistic ontologies enables process philosophy\'s coherence with modern physics. Whitehead\'s metaphysical systematization integrates quantum indeterminacy, relativity\'s spatiotemporal structures, and evolutionary emergence. Contemporary process theology and pragmatist philosophy extend Whiteheadian insights. Process ontology offers resources addressing emergence, complexity, and genuine novelty in natural and social systems.',
      turkish_text: 'Whitehead\'ın süreç felsefesi, varlık üzerinde olmayı, madde üzerinde olayı tercih ederek metafiziği temel olarak yeniden kurmaktadır. Fiili olanaklar, gerçekliğin temel birimlerini kurmakta, deneyim ve ajansı temel ontolojik seviyelerde kapsayıcı. Somutlaşma süreci, fiili olanakların çoklu prehensiyonları belirli gerçeklikler içinde nasıl sentez yaptığını açıklamaktadır. Çift kutuplu ilahilik, gerekli ve durumsal yönleri kapsayıcı olayı, monoteistik uyum tehdid eden geleneksel theodicy sorunlarını çözmektedir. Yaratıcılık, deterministik kapanışı önleyen ve yeniliğin kalıcı ortaya çıkışını sağlayan nihai metafizik ilke olarak işlev görmektedir. Madde metafiziğinin reddi ve atomistik ontoloji, süreç felsefesinin modern fiziğe uyum sağlanabilirliğini sağlamaktadır.',
      word_count: 92,
      estimated_time_minutes: 5
    },
    {
      id: 'c2-9',
      level_id: 'c2',
      title: 'Postmodern Aesthetics',
      english_text: 'Postmodern aesthetics challenges modernist progressive teleologies by embracing pastiche, irony, and ontological indeterminacy. Baudrillard\'s hyperreality thesis claims that simulations have supplanted reality, rendering distinction between representation and represented metaphysically impossible. The sublime, reconceptualized through Lyotard, represents the unpresentable exceeding representation\'s capacities. Jameson\'s late capitalism diagnosis argues that postmodern aesthetics reflect economic mode\'s fundamental transformation toward immaterial production and financial speculation. Schiller\'s recuperation of sentiment and decorativity against formalist austerity rehabilitates previously marginalized aesthetic categories. Aesthetic autonomy\'s modernist fiction dissolves as artworks become increasingly integrated with commodity circulation. Decentralization of artistic authority challenges modernist genius cults through participatory and appropriative practices. Contemporary postmodern aesthetics interrogates digital reproduction\'s implications for aesthetic uniqueness and authenticity.',
      turkish_text: 'Postmodern estetik, modern ilerlemeci teleolojilere pastiş, ironi ve ontolojik belirsizliği kapsayarak meydan okumaktadır. Baudrillard\'ın hiper-realite tezi, simülasyonların gerçekliğin yerine geçtiğini, temsil ve temsil edilenin fark etmesini metafizik olarak imkansız kılmaktadır. Sublime, Lyotard aracılığıyla yeniden kavramsallaştırılmış, temsil kapasitesini aşan sunulamazı temsil etmektedir. Jameson\'ın geç kapitalizm tanısı, postmodern estetiklerin ekonomik mod\'un gayri maddi üretim ve finansal spekulasyon yönündeki temel dönüşümünü yansıttığını savunmaktadır. Schiller\'ın duygu ve dekoratifliliğinin formalist katılığa karşı iyileştirilmesi, daha önce marjinalleştirilmiş estetik kategorileri yeniden gözcü etmektedir. Estetik özerkliğinin modern fikayetinin dijital yeniden üretim\'nin temsili eşsizliğine ve özgünlüğe uyguladığını fark ettir.',
      word_count: 92,
      estimated_time_minutes: 5
    },
    {
      id: 'c2-10',
      level_id: 'c2',
      title: 'Cybernetics and Systems Theory',
      english_text: 'Wiener\'s foundational cybernetics reconstitutes control and communication theories by treating organisms and machines equivalently as self-regulating systems. Negative feedback mechanisms enable homeostatic maintenance and goal-directedness through information circulation. Von Neumann\'s self-reproducing automata theory establishes theoretical foundations for understanding biological reproduction mechanistically. Second-order cybernetics reflexively interrogates the observer\'s embeddedness within systems, precluding transcendental externality. Autopoiesis, developed by Maturana and Varela, conceptualizes living systems as self-producing organizations maintaining invariant identity through continuous structural change. Systems theory\'s holistic perspective resists decomposition into isolated components, emphasizing emergent properties arising from complex interactions. Ashby\'s law of requisite variety argues that systems require internal complexity matching environmental complexity. Contemporary systems-theoretic approaches integrate cybernetics with emergence, complexity science, and posthuman ontologies.',
      turkish_text: 'Wiener\'ın temel sibernetik, organizmalar ve makineleri kendi kendini düzenleyen sistemler olarak eşit olarak ele alarak kontrol ve iletişim teorilerini yeniden kurmaktadır. Negatif geri bildirim mekanizmaları, bilgi dolaşımı aracılığıyla homeobstatik bakımı ve amaç yönelimini sağlamaktadır. Von Neumann\'ın kendi kendini çoğaltan otomat teorisi, biyolojik üretimi mekanistik anlama için teorik temeller kurmaktadır. İkinci dereceden sibernetik, gözlemcinin sistemler içine gömülülüğünü düşünmektedir, transandantal dışsallığı önlemektedir. Maturana ve Varela tarafından geliştirilen autopoiyesis, yaşayan sistemleri sürekli yapısal değişim aracılığıyla değişmez kimlik koruyan kendi kendini üreten örgütler olarak kavramsallaştırmaktadır. Sistem teorisinin bütünsel perspektifi, bileşenleri izole etmeye direnmekte, karmaşık etkileşimlerden ortaya çıkan ortaya çıkan özellikleri vurglamaktadır.',
      word_count: 92,
      estimated_time_minutes: 5
    },
    {
      id: 'c2-11',
      level_id: 'c2',
      title: 'Quantum Ontology',
      english_text: 'Quantum mechanics challenges classical ontological presuppositions regarding substance, identity, and causality fundamentally. Bohr\'s complementarity principle demonstrates that quantum systems exhibit mutually exclusive properties depending upon measurement apparatus. The measurement problem raises whether wave function collapse represents physical reality or merely epistemic updating. Many-worlds interpretation denies collapse, multiplying universes with branching actualizations of quantum superpositions. Relational quantum mechanics, developed by Rovelli, argues that properties exist only relative to interactive systems, precluding absolute descriptions. Quantum entanglement exhibits non-locality violating relativistic locality assumptions, necessitating fundamental reconceptualizations of spacetime. The ontological status of quantum fields remains disputed between substantialist and instrumental interpretations. Quantum Bayesianism reconstitutes probability through subjective belief updating, challenging objective probability interpretations. Contemporary quantum ontology addresses interpretational questions\' implications for metaphysical realism and scientific truth.',
      turkish_text: 'Kuantum mekaniği, madde, kimlik ve nedensellik hakkında klasik ontolojik varsayımları temel olarak soruşturur. Bohr\'ın tamamlayıcılık ilkesi, kuantum sistemlerinin ölçüm cihazına bağlı olarak karşılıklı dışlayıcı özellikleri sergileyen göstermektedir. Ölçüm sorunu, dalga işlevi çöküşünün fiziksel gerçekliği temsil etme veya sadece epistemik güncellemeyi temsil etme soruşturur. Birçok-dünyalar yorumu çöküşü reddederek, kuantum süperpozisyonun branşlı gerçekleştirileri ile evrenleri çoğaltmaktadır. Rovelli tarafından geliştirilen ilişkisel kuantum mekaniği, özelliklerin yalnızca etkileşimli sistemlere göre var olduğunu savunmakta, mutlak tanımları önlemektedir. Kuantum dolaşıklığı, göreceli yerellik varsayımlarını ihlal eden yerel olmayan korelasyonlar sergiler, uzayzamanın temel yeniden kavramsallaştırmalarını gerektirmektedir. Kuantum alanlarının ontolojik durumu, madde ve araçsal yorumlar arasında tartışmalı olmaya devam ediyor.',
      word_count: 92,
      estimated_time_minutes: 5
    }
  ]
};

// ============================================================================
// UTILITIES
// ============================================================================

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {} as SupabaseClient;

// Generate word translations for Turkish tooltips
function generateWordTranslations(englishText: string, turkishText: string): WordTranslation[] {
  const englishWords = englishText.toLowerCase().split(/\s+/);
  const turkishWords = turkishText.split(/\s+/);
  return englishWords.slice(0, Math.min(englishWords.length, turkishWords.length))
    .map((word, idx) => ({
      word: word.replace(/[,.!?;:'"]/g, ''),
      translation: turkishWords[idx] || word
    }))
    .filter(w => w.word.length > 0);
}

// Calculate WPM
function calculateWPM(characterCount: number, timeSeconds: number): number {
  if (timeSeconds === 0) return 0;
  const words = characterCount / 5;
  const minutes = timeSeconds / 60;
  return Math.round(words / minutes);
}

// Text-to-Speech using Web Speech API
function speakText(text: string): void {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

// ============================================================================
// AUTH CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session on mount
    if (supabase.auth) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email
          });
        }
        setLoading(false);
      });

      // Listen for auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!supabase.auth) throw new Error('Auth not configured');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase.auth) throw new Error('Auth not configured');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    if (!supabase.auth) throw new Error('Auth not configured');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) throw error;
  };

  const signInWithApple = async () => {
    if (!supabase.auth) throw new Error('Auth not configured');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: window.location.origin }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!supabase.auth) throw new Error('Auth not configured');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signInWithApple, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// ============================================================================
// COMPONENTS
// ============================================================================

// Login Screen
const LoginScreen: React.FC = () => {
  const { signUp, signIn, signInWithGoogle, signInWithApple } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TypeMaster
            </h1>
            <p className="text-gray-600">Master English through typing</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="space-y-3">
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              onClick={signInWithApple}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 13.5c-.91 2.92.37 5.5 2.54 6.29 2.55.98 4.86.38 6.02-1.48.99-1.58.85-4.02-.52-5.33-1.47-1.44-3.97-1.13-5.12.09-.51.51-.9 1.16-1.03 1.88-1.1-.39-1.98-.62-2.87-.62-1.6 0-2.93.76-3.65 2.15-.76-1.44-2.17-2.62-3.9-2.62-1.99 0-3.97 1.25-4.38 3.13-.24 1.09.08 2.19.8 2.94.59.6 1.4.94 2.29.94.94 0 1.73-.35 2.25-.93.67.58 1.55.93 2.52.93 1.47 0 2.86-.65 3.74-1.67.33.72.99 1.2 1.77 1.2 1.23 0 2.16-.88 2.27-2.04.51.14 1.05.14 1.6.14 1.88 0 3.57-.62 4.86-1.68z"/>
              </svg>
              Apple
            </button>
          </div>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-gray-600 hover:text-gray-900 text-sm"
          >
            {isSignUp ? 'Already have an account?' : 'Need an account?'} {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Level Selection Screen
const LevelSelectionScreen: React.FC<{
  levels: Level[];
  onSelectLevel: (levelId: string) => void;
  darkMode: boolean;
}> = ({ levels, onSelectLevel, darkMode }) => {
  const { signOut } = useAuth();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            TypeMaster
          </h1>
          <button
            onClick={signOut}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              darkMode
                ? 'bg-red-900/30 text-red-200 hover:bg-red-900/50'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Choose Your Level
          </h2>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Select a CEFR level to start typing and improving your English
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => onSelectLevel(level.level_code)}
              className={`p-8 rounded-xl transition transform hover:scale-105 ${
                darkMode
                  ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                  : 'bg-white hover:shadow-xl border border-gray-200'
              }`}
            >
              <div className="text-center">
                <div className={`text-5xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent`}>
                  {level.level_code}
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {level.level_name}
                </h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {level.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'login' | 'levels'>('login');
  const [levels, setLevels] = useState<Level[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(true);

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Load levels when user logs in
  useEffect(() => {
    if (user && supabase.from) {
      setLoadingLevels(true);
      supabase
        .from('levels')
        .select('*')
        .order('order_index', { ascending: true })
        .then(({ data, error }) => {
          if (data) setLevels(data as Level[]);
          setLoadingLevels(false);
        });
    }
  }, [user]);

  // Redirect to levels when user logs in
  useEffect(() => {
    if (user) {
      setCurrentScreen('levels');
    } else {
      setCurrentScreen('login');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (currentScreen === 'levels') {
    if (loadingLevels) {
      return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-slate-100'} flex items-center justify-center`}>
          <div className={`text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current mx-auto mb-4"></div>
            <p>Loading levels...</p>
          </div>
        </div>
      );
    }

    return (
      <div className={darkMode ? 'dark' : ''}>
        <LevelSelectionScreen 
          levels={levels} 
          onSelectLevel={() => {}} 
          darkMode={darkMode}
        />
      </div>
    );
  }

  return <LoginScreen />;
};

export default App;
export { AuthProvider };
