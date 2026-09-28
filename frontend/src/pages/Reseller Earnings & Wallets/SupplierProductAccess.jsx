import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavDrawer from '../../components/NavDrawer';
import AppBottomNav from '../../components/AppBottomNav';
import { getDropshipperApp } from '../../services/dropshipperSessionStore';

// Sample verified supplier products dataset for dropshippers
const SUPPLIER_PRODUCTS = [
  {
    id: 1,
    name: 'Pure Chanderi Silk Handblock Anarkali Set',
    category: 'Women Ethnic',
    sku: 'SUR-CHK-001',
    barcode: '890456123001',
    supplier: {
      name: 'Surat Master Weaves Pvt Ltd',
      location: 'Surat, Gujarat',
      rating: 4.85,
      reviewsCount: 1420,
      verified: true,
      dispatchTime: 'Dispatches in 18 hrs',
      returnPolicy: '7 Days Hassle-Free Return',
      rtoScore: 'Low RTO (2.8%)',
      moq: '1 Piece (Zero MOQ)',
    },
    supplierPrice: 380,
    mrp: 999,
    suggestedResale: 699,
    stock: 148,
    stockStatus: 'in_stock', // 'in_stock' | 'low_stock' | 'out_of_stock'
    fastDispatch: true,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC0ZnPCaQs1V-mDSDM7ur2kI3Dz5Nbk7XDFuZH3o4lRL3dsUn6O1yaEEHy-VLMCln7Sd6be5Qrq94Zfg63DDyBzVhYJePlmHDXghznQTyuuKMUm5Mm87Ajqce1Y0O-aCUAclPK1J3ONzX2FEjylGuRwxAPi7MjwxctToYvQMizwARfCrJZ5eBA2dlEycS3G6fvLnnmrYBrguUZ5NFiw9091KDpVXtHLkqcVjyakyCacLuB5sq9QG0-dXjlee_MI1KD7fzfqJZ9hE7U',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD0zqmw7ba_XFDIMO6oyX-ILUKOJgIMuPHjQHmER1KSXi4yclRGSPaFRWJJc7uqCXrLyuOZB5pF6W9WnzFkT4T60VwY7uLrFzTvD9dwE04M23l7pGMu2N9_mNh3dIciAjlMaq4CCNHCtjsjPsAXVnUWIzuy88jS-AXIyF662WcDdlDcTQBqikiQkpbng2C7siDr0Cfpn4tI2OPGK5ut0GiQ2urqGnEEsMeCKdoSG60Mzopnd90gu9Axj_jDhaDAqbSN79R6G9BIo88',
    ],
    description:
      'Exquisite handcrafted Chanderi Silk Anarkali Kurti crafted with authentic Sanganeri handblock floral prints. Features delicate zari piping along the neckline, matching cotton dupatta with gold gotta patti borders, and comfortable matching straight pants.',
    specs: {
      fabric: 'Pure Chanderi Silk Blend (with cotton lining)',
      weave: 'Handcrafted Powerloom Weave',
      sleeves: '3/4th Sleeves with Zari cuffs',
      weight: '420g',
      packageDims: '30cm x 24cm x 4cm',
      care: 'Dry clean recommended for first wash, mild cold wash thereafter',
      origin: 'Surat, India',
    },
    variants: [
      { size: 'S (36)', sku: 'SUR-CHK-001-S', stock: 24 },
      { size: 'M (38)', sku: 'SUR-CHK-001-M', stock: 45 },
      { size: 'L (40)', sku: 'SUR-CHK-001-L', stock: 52 },
      { size: 'XL (42)', sku: 'SUR-CHK-001-XL', stock: 20 },
      { size: 'XXL (44)', sku: 'SUR-CHK-001-XXL', stock: 7 },
    ],
  },
  {
    id: 2,
    name: 'Aura Minimalist Precision Dial Timepiece',
    category: 'Gadgets',
    sku: 'AUR-WCH-001',
    barcode: '890782349112',
    supplier: {
      name: 'Chronos Direct Manufacturer',
      location: 'Ahmedabad, Gujarat',
      rating: 4.9,
      reviewsCount: 890,
      verified: true,
      dispatchTime: 'Dispatches in 24 hrs',
      returnPolicy: '10 Days Replacement Warranty',
      rtoScore: 'Ultra-Low RTO (1.9%)',
      moq: '1 Piece',
    },
    supplierPrice: 420,
    mrp: 1499,
    suggestedResale: 799,
    stock: 42,
    stockStatus: 'in_stock',
    fastDispatch: true,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAV-4ZvD8edFl9Lx7SCSwdFXrKFRysgbseviqrpcYwlPpsVwMh6SSVFORqFmVJG-aZH3i_-DNWbVQptPCLNiw8CTD_e9BbXD_we51x_ztnvwqIFVYXuiWj1_76nc8HgnYAsh_NOyFmzhPkVBnuaDIMKYijWD3twWldxefTiqS5RyroofWD7VV-jq8Jy9lWB_UNzy4C6eMCN8Fe-E5cybIAqaGsHyVSSqqW9YOfZUAqay8ve_ELMRJJ6OGJT6aGbgx_BiY6aPqBpTQ8',
    ],
    description:
      'Ultra-thin luxury minimalist analog watch engineered with Japanese quartz movement, scratch-resistant sapphire mineral glass, and genuine vegan leather straps with quick-release spring bars.',
    specs: {
      movement: 'Japanese Quartz Caliber',
      dialDiameter: '40mm Slim Case',
      strapMaterial: 'Genuine Handcrafted Vegan Leather',
      waterResistance: '3 ATM (Splash Proof)',
      weight: '85g',
      packageDims: '14cm x 7cm x 3cm (Gift Box included)',
      origin: 'Gujarat, India',
    },
    variants: [
      { size: 'Rose Gold / Brown Strap', sku: 'AUR-WCH-001-RGB', stock: 18 },
      { size: 'Matte Black / Black Strap', sku: 'AUR-WCH-001-BLK', stock: 15 },
      { size: 'Silver / Navy Blue Strap', sku: 'AUR-WCH-001-SLV', stock: 9 },
    ],
  },
  {
    id: 3,
    name: 'SonicFlow Pro Wireless Active Earbuds',
    category: 'Electronics',
    sku: 'SNC-HDP-042',
    barcode: '890601934812',
    supplier: {
      name: 'Zenith Audio Labs & Tech Hub',
      location: 'Bengaluru, Karnataka',
      rating: 4.75,
      reviewsCount: 3100,
      verified: true,
      dispatchTime: 'Dispatches in 12 hrs',
      returnPolicy: '7 Days Return / 1 Year Warranty',
      rtoScore: 'Low RTO (3.4%)',
      moq: '1 Piece',
    },
    supplierPrice: 499,
    mrp: 2299,
    suggestedResale: 899,
    stock: 5,
    stockStatus: 'low_stock',
    fastDispatch: true,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCpf1xhClgaViwcD1tvJ8p52cL4Sfmkw06XotfX5KuzSAjOTm_EMVii_2t3xgDxVZVxopFmW1AoX5deQyT3NfgotaNOV1BXKtjZ6P8KiurUdzcHKva6xDoBWJ1zkouAgd1UP4lCSyiTGZ_dDecQuqUZCyiQrFFs0O-9ag4PFXAW2DsoBNIOmx3SZd3InVuStS1n5kvFjKO3B_pZqsnTGJ-VhXQzpF6zdSZIltKaMTjFGR_Gq6vtL28cmdp6n3PsIgI4B2lIa2sJ6tM',
    ],
    description:
      'True wireless stereo earbuds featuring environmental noise cancellation (ENC), 13mm dynamic bass drivers, 40 hours playtime with fast USB-C charging pod, and IPX5 sweat-resistant nano coating.',
    specs: {
      batteryLife: 'Up to 40 Hours with Charging Case',
      connectivity: 'Bluetooth v5.3 (Ultra Low Latency)',
      driverSize: '13mm Titanium Composite Bass Drivers',
      chargingPort: 'Type-C Fast Charge (10 min = 3 hrs play)',
      weight: '46g (Pod + Buds)',
      packageDims: '10cm x 10cm x 4cm',
      origin: 'Bengaluru, India',
    },
    variants: [
      { size: 'Midnight Black', sku: 'SNC-HDP-042-BLK', stock: 2 },
      { size: 'Arctic White', sku: 'SNC-HDP-042-WHT', stock: 3 },
    ],
  },
  {
    id: 4,
    name: 'Velocity Pro Breathable Athletic Runners',
    category: 'Footwear',
    sku: 'VEL-SNK-992',
    barcode: '890184719230',
    supplier: {
      name: 'Agra Footwear Syndicate',
      location: 'Agra, Uttar Pradesh',
      rating: 4.6,
      reviewsCount: 620,
      verified: true,
      dispatchTime: 'Dispatches in 24 hrs',
      returnPolicy: '7 Days Size Replacement',
      rtoScore: 'Standard RTO (4.1%)',
      moq: '1 Piece',
    },
    supplierPrice: 550,
    mrp: 1899,
    suggestedResale: 949,
    stock: 0,
    stockStatus: 'out_of_stock',
    fastDispatch: false,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBipv6iOh1No-Sk3kO1yZMB7VukLBZ-u8dbBQHAMyzIj7JNYevlScCb96BGSGBn9sUqPmj7KuCqnFnyXh2pdewmdHWUt31PKGsQ0Uasut7qrCn0TcOl1y-qoRwZOs8xBIIs-f8CyPi6r2ED0japxIZ7BTNFwns-q8mTXBUGnM5B-mPbFbPHt5FcypbupUeFT6BG6VvH_LusAebLRrD1OduDEREx1cRdIOEcpyyGCSzHdTDcDoIjMmVsVhI92yLJCIIig9vyEWsn7Ng',
    ],
    description:
      'Lightweight engineered mesh running shoes with responsive EVA foam cushion sole, shock absorption heel bridge, and anti-skid rubber traction pods. Ideal for daily training, running, and casual athleisure.',
    specs: {
      upperMaterial: 'Breathable Honeycomb Knitted Mesh',
      soleMaterial: 'Dual-Density Cloud EVA Sole',
      closure: 'Lace-Up with Padded Collar',
      weight: '520g per pair',
      packageDims: '32cm x 20cm x 12cm Box',
      origin: 'Agra, India',
    },
    variants: [
      { size: 'UK 6', sku: 'VEL-SNK-992-06', stock: 0 },
      { size: 'UK 7', sku: 'VEL-SNK-992-07', stock: 0 },
      { size: 'UK 8', sku: 'VEL-SNK-992-08', stock: 0 },
      { size: 'UK 9', sku: 'VEL-SNK-992-09', stock: 0 },
    ],
  },
  {
    id: 5,
    name: 'Urban Canvas Multi-Utility Explorer Rucksack',
    category: 'Home & Living',
    sku: 'URB-BPK-112',
    barcode: '890918237123',
    supplier: {
      name: 'Delhi Craft & Luggage Mill',
      location: 'New Delhi, Delhi',
      rating: 4.8,
      reviewsCount: 2150,
      verified: true,
      dispatchTime: 'Dispatches in 24 hrs',
      returnPolicy: '7 Days Easy Returns',
      rtoScore: 'Low RTO (2.1%)',
      moq: '1 Piece',
    },
    supplierPrice: 320,
    mrp: 899,
    suggestedResale: 599,
    stock: 118,
    stockStatus: 'in_stock',
    fastDispatch: true,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDHrYMcC-EEgrXqS1mkRlJvIiMJPwcEwPiiRQ_MZZqD-ha5M_yvOZYQLUyzmxhW5B_Wb4Z7vVkc7YctBI39fFI0RI_dOyNa59KlrsQtFAqeBkNjTHcEV6mzwwlM2-8R8chDMgFt5gK6kSNvmsGlS_WT8O2_3OwBhbWabtxZEtJsWliDGhep3lN691t0GsPCFtAlorMmMVjZ32z5u5v6NtLxEXkOfH5Rttm6gPoN2dlLCljSW_nZpkTgYqWK4vshasXyI9LaMB-52Wo',
    ],
    description:
      'Heavy-duty water-resistant vintage canvas backpack with padded 15.6-inch laptop compartment, ergonomic S-curve shoulder straps, metal alloy buckles, and hidden anti-theft back pocket for travel and daily commute.',
    specs: {
      material: '16oz Washed Waxed Cotton Canvas',
      capacity: '28 Litres',
      laptopCompartment: 'Fits up to 15.6 inch laptops',
      weight: '680g',
      packageDims: '44cm x 30cm x 6cm',
      origin: 'New Delhi, India',
    },
    variants: [
      { size: 'Olive Military Green', sku: 'URB-BPK-112-OLV', stock: 54 },
      { size: 'Coffee Brown', sku: 'URB-BPK-112-BRN', stock: 40 },
      { size: 'Charcoal Grey', sku: 'URB-BPK-112-GRY', stock: 24 },
    ],
  },
  {
    id: 6,
    name: 'Vintage Distressed Washed Denim Biker Jacket',
    category: 'Western Wear',
    sku: 'RDR-JCK-008',
    barcode: '890281928374',
    supplier: {
      name: 'Ludhiana Mills & Denim Co',
      location: 'Ludhiana, Punjab',
      rating: 4.7,
      reviewsCount: 1680,
      verified: true,
      dispatchTime: 'Dispatches in 24 hrs',
      returnPolicy: '7 Days Easy Return',
      rtoScore: 'Low RTO (3.0%)',
      moq: '1 Piece',
    },
    supplierPrice: 480,
    mrp: 2499,
    suggestedResale: 999,
    stock: 76,
    stockStatus: 'in_stock',
    fastDispatch: true,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCDPmD9-ovlIa-MD4BO39HPO96wxIRmWrYe8qYWvqkgptxYMCtQfivT9lWRbcMeXNi-Be7aT1fSOpzmtPE6QJMQbmsK-caGrrcQyM1aGztg5q70fVH5vVSd-huuv4T10VbeNArAzmgX_bWCzTnnnzDjfxd0bhLnV1OjRGwViGcBWLwJ0r76tf9TqTUqy3kSdVBeusII5UfWmQaFa2mxVvqsetPyMOBZibBWGA9Jw1D2ZeqkjFgFCzihuFUgTfa_BFgo9W_AOQ8dQP8',
    ],
    description:
      'Classic trucker cut vintage denim jacket tailored from 100% cotton ring-spun denim. Finished with authentic stone enzyme wash, brass logo shank buttons, twin flap chest pockets, and adjustable waist tabs.',
    specs: {
      fabric: '100% Cotton 12.5oz Slub Denim',
      wash: 'Heavy Acid Stone Wash with Subtle Whiskering',
      hardware: 'Antique Copper Rust-Proof Shank Buttons',
      weight: '750g',
      packageDims: '35cm x 28cm x 5cm',
      origin: 'Ludhiana, India',
    },
    variants: [
      { size: 'M (38)', sku: 'RDR-JCK-008-M', stock: 22 },
      { size: 'L (40)', sku: 'RDR-JCK-008-L', stock: 31 },
      { size: 'XL (42)', sku: 'RDR-JCK-008-XL', stock: 23 },
    ],
  },
  {
    id: 7,
    name: 'Varanasi Royal Jacquard Kanjivaram Silk Saree',
    category: 'Women Ethnic',
    sku: 'VAR-SAR-701',
    barcode: '890456789123',
    supplier: {
      name: 'Varanasi Heritage Handlooms',
      location: 'Varanasi, Uttar Pradesh',
      rating: 4.88,
      reviewsCount: 2410,
      verified: true,
      dispatchTime: 'Dispatches in 48 hrs',
      returnPolicy: '7 Days Return / Exchange',
      rtoScore: 'Low RTO (2.1%)',
      moq: '1 Piece',
    },
    supplierPrice: 650,
    mrp: 2999,
    suggestedResale: 1399,
    stock: 0,
    stockStatus: 'out_of_stock',
    fastDispatch: false,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCv6DgYAFvGbNJ5APR46xls7W7pN8o67LV_V8M5UUB3Wg82Y35C7rJLKqw75qntSEhXK9Ac79emuJ4yu6ynPkR2JydFC6jiz4hX9YKLKuNXBWzZw0kd6-gTNGPGPIVTUu2jWoo-_IZeK2TFB_ztWZHpxLskwKn1VFX5JVtEDngEEoOxNZEBXYgFu750hJPiqgqEdeQQsYhxshiBMwzme2PxnQurkxYsJBvCm1XRNK2YYfbuw2CqeAw_PTqWgD1a-zv-uQ18YTCL9Ek',
    ],
    description:
      'Luxurious authentic Banarasi silk saree enriched with woven metallic zari floral motifs, contrast designer pallu, and matching unstitched blouse fabric. Ideal for wedding seasons and festive celebrations.',
    specs: {
      fabric: 'Rich Kanjivaram Blend Art Silk',
      pallu: 'Heavy Golden Zari Brocade Work',
      length: '5.5m Saree + 0.8m Blouse Piece',
      weight: '620g',
      packageDims: '34cm x 26cm x 4cm',
      origin: 'Varanasi, India',
    },
    variants: [
      { size: 'Ruby Crimson Red', sku: 'VAR-SAR-701-RED', stock: 0 },
      { size: 'Emerald Peacock Green', sku: 'VAR-SAR-701-GRN', stock: 0 },
      { size: 'Royal Midnight Blue', sku: 'VAR-SAR-701-BLU', stock: 0 },
    ],
  },
  {
    id: 8,
    name: 'TitanEdge Wireless Over-Ear Studio ANC Headphones',
    category: 'Electronics',
    sku: 'TTN-ANC-802',
    barcode: '890601934988',
    supplier: {
      name: 'SonicTech Audio Systems',
      location: 'Bengaluru, Karnataka',
      rating: 4.7,
      reviewsCount: 1890,
      verified: true,
      dispatchTime: 'Dispatches in 24 hrs',
      returnPolicy: '10 Days Replacement',
      rtoScore: 'Low RTO (3.2%)',
      moq: '1 Piece',
    },
    supplierPrice: 890,
    mrp: 3499,
    suggestedResale: 1699,
    stock: 0,
    stockStatus: 'out_of_stock',
    fastDispatch: false,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDjMHrBBEaOKIaIxs-krCV8r98eScU7K8WD2ssKdbpMS3VW3A0oI_lvyCen00es3iKUWB5nJqn6FmQXPx3F3eAqR610Qe6djt3e0oFC7-UdI8bgs6DlOuJi9pm5qHbrPdN3UMOvwuaFC8EAmPkWPT_hQxo9L3pFSRuctjRjBQ_qekaPu-2bTYSSKr6hK25KISmNQl1lt-FDl7rmGsBfBb4Kjjto8Kt5E_NNuTjPjueyHTibBpPS--j-xqMV9xWe0bC1AWbvqWFdcNs',
    ],
    description:
      'Professional hybrid active noise cancellation headphones with 40mm beryllium drivers, memory foam earcups, 60 hours battery backup, and dedicated gaming low latency mode.',
    specs: {
      batteryLife: '60 Hours ANC Off / 45 Hours ANC On',
      bluetoothVersion: 'Bluetooth 5.3 + AUX Support',
      ancReduction: 'Up to -35dB Active Cancellation',
      weight: '245g',
      packageDims: '22cm x 19cm x 8cm Travel Hard Case',
      origin: 'Bengaluru, India',
    },
    variants: [
      { size: 'Matte Graphite Grey', sku: 'TTN-ANC-802-GRY', stock: 0 },
      { size: 'Deep Space Black', sku: 'TTN-ANC-802-BLK', stock: 0 },
    ],
  },
  {
    id: 9,
    name: 'Artisan Handcrafted Himalayan Natural Rock Salt Lamp',
    category: 'Home & Living',
    sku: 'HIM-LMP-903',
    barcode: '890782349554',
    supplier: {
      name: 'Jaipur EcoLiving Crafts',
      location: 'Jaipur, Rajasthan',
      rating: 4.82,
      reviewsCount: 3120,
      verified: true,
      dispatchTime: 'Dispatches in 36 hrs',
      returnPolicy: '7 Days Replacement',
      rtoScore: 'Low RTO (1.8%)',
      moq: '1 Piece',
    },
    supplierPrice: 240,
    mrp: 999,
    suggestedResale: 549,
    stock: 0,
    stockStatus: 'out_of_stock',
    fastDispatch: false,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCRTty01mkjoiq24vG7JCv67mTgkB7lUXxFoiqUs_NruWp7TRi9kyFVti-Q8FxVFXZMxzH2kALIFEMvmsJG1ZD32g2mpFXHIhlP0AbFLDNsWpfuy-2Tag0dQHZ3m9I7xSfHtIp8XJH4jFO7Ysi5cLTxylwAWQXvNVg2G-C0YwF-1sGgCeVOsq1lgSssmigBCKxuQ8euHmXNKQuHTm2-tleA4ENttn6k5HdXGQ4mQBuS8I7A04qzGhNx-CgKErSOAuv4bJYF5eiohe4',
    ],
    description:
      '100% authentic hand-carved pink Himalayan crystal rock salt lamp mounted on a polished neem wood base. Releases negative air ions to reduce stress and improve ambient bedroom atmosphere.',
    specs: {
      material: 'Pure Pink Himalayan Crystal Salt',
      base: 'Treated Termite-Resistant Neem Wood',
      bulbType: '15W Warm Amber E14 Bulb with dimmer switch',
      weight: '2.4 kg',
      packageDims: '18cm x 18cm x 26cm Padded Thermocol Box',
      origin: 'Jaipur, India',
    },
    variants: [
      { size: 'Medium (2-3 kg)', sku: 'HIM-LMP-903-MED', stock: 0 },
      { size: 'Large (3-5 kg)', sku: 'HIM-LMP-903-LRG', stock: 0 },
    ],
  },
  {
    id: 10,
    name: 'Smart AMOLED Calling Smartwatch with Heart & SpO2',
    category: 'Gadgets',
    sku: 'GDT-WCH-606',
    barcode: '890184719888',
    supplier: {
      name: 'Noida MicroTech Electronics',
      location: 'Noida, Uttar Pradesh',
      rating: 4.75,
      reviewsCount: 1540,
      verified: true,
      dispatchTime: 'Dispatches in 18 hrs',
      returnPolicy: '7 Days Return / 1 Year Warranty',
      rtoScore: 'Low RTO (2.6%)',
      moq: '1 Piece',
    },
    supplierPrice: 620,
    mrp: 2799,
    suggestedResale: 1199,
    stock: 8,
    stockStatus: 'low_stock',
    fastDispatch: true,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBX-Oxg3tIQjqdjNYMY_pihafWimHmYMcVgO1rLRx7FPQ-goP04XXTctzrP1EUSgiz2Jn5kz3WMVptCQvptirIdlET4u4VdQGQDZ0fl83N6tuSS0bBXW-MRY4efXvkGVJfmMly4zDgrkXKhoqEXjA2oE0f5PNLQ1_T0g1qHJVSEUYpca-vBnqeKJodW6IODtvR5Jyku3okYm2C5q48nT846n7GkYVK8g8REFli2rJ6HZ1vYnO22yYWGJQI950O4_9pkfKgKoVfKVeI',
    ],
    description:
      '1.96-inch curved AMOLED display smartwatch featuring Bluetooth calling with noise-canceling mic, 110+ sports modes, 24/7 health tracking, and 7-day battery life.',
    specs: {
      display: '1.96" Curved HD AMOLED (550 Nits Peak)',
      battery: '7 Days Standard Use, 2 Days Calling',
      waterproof: 'IP68 Dust & Water Resistant',
      weight: '48g',
      packageDims: '12cm x 8cm x 5cm',
      origin: 'Noida, India',
    },
    variants: [
      { size: 'Stealth Black', sku: 'GDT-WCH-606-BLK', stock: 5 },
      { size: 'Silver / Orange Strap', sku: 'GDT-WCH-606-ORG', stock: 3 },
    ],
  },
];

const CATEGORIES = ['All', 'Women Ethnic', 'Western Wear', 'Gadgets', 'Electronics', 'Footwear', 'Home & Living'];

export default function SupplierProductAccess() {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('meesho_dropshipper_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.brandName?.toLowerCase().includes('sharma') ||
          parsed.storeUrl?.toLowerCase().includes('sharma') ||
          parsed.name?.toLowerCase().includes('rajesh')
        ) {
          parsed.name = 'Aura Trends';
          parsed.brandName = 'Aura Trends';
          parsed.storeUrl = 'https://auratrends.shop';
          parsed.platform = 'Shopify';
          localStorage.setItem('meesho_dropshipper_session', JSON.stringify(parsed));
        }
        return parsed;
      }
      const app = getDropshipperApp();
      return {
        dropshipperId: app?.id || 'DSP-KYC-9421',
        name: app?.brandName || 'Aura Trends',
        proprietor: app?.proprietorName || 'Aura Trends',
        tier: 'Tier 1 Verified Dropshipper',
        platform: 'Shopify',
        storeUrl: 'https://auratrends.shop',
      };
    } catch {
      return {
        dropshipperId: 'DSP-KYC-9421',
        name: 'Aura Trends',
        proprietor: 'Aura Trends',
        tier: 'Tier 1 Verified Dropshipper',
        platform: 'Shopify',
        storeUrl: 'https://auratrends.shop',
      };
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'in_stock' | 'low_stock' | 'fast_dispatch'
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'price_low' | 'price_high' | 'margin_high'

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [resaleInput, setResaleInput] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Single Connected Store Integration states
  const [connectedStore, setConnectedStore] = useState(() => {
    try {
      const app = getDropshipperApp();
      const sessionSaved = localStorage.getItem('meesho_dropshipper_session');
      const sessionObj = sessionSaved ? JSON.parse(sessionSaved) : null;
      const storeSaved = localStorage.getItem('meesho_connected_store');
      const parsedStoreSaved = storeSaved ? JSON.parse(storeSaved) : null;

      let rawUrl = sessionObj?.storeUrl || parsedStoreSaved?.storeUrl || 'https://auratrends.shop';
      if (rawUrl.toLowerCase().includes('sharma') || rawUrl.toLowerCase().includes('sharmadirect')) {
        rawUrl = 'https://auratrends.shop';
      }
      const cleanUrl = rawUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'auratrends.shop';
      const fullUrl = rawUrl.startsWith('http') ? rawUrl : `https://${cleanUrl}`;

      let storeBrand = sessionObj?.brandName || parsedStoreSaved?.storeName || app?.brandName || 'Aura Trends';
      if (storeBrand.toLowerCase().includes('sharma')) {
        storeBrand = 'Aura Trends';
      }

      const storeObj = {
        isConnected: true,
        storeName: storeBrand,
        storeUrl: cleanUrl,
        fullStoreUrl: fullUrl,
        platform: sessionObj?.platform === 'WooCommerce' && cleanUrl.includes('auratrends') ? 'Shopify' : (sessionObj?.platform || parsedStoreSaved?.platform || 'Shopify'),
        capacity: sessionObj?.capacity || parsedStoreSaved?.capacity || '50 - 200 orders/month',
        pan: app?.panNumber || sessionObj?.pan || 'ABCDE1234F',
        aadhaar: app?.aadhaarNumber || sessionObj?.aadhaar || '4829 1920 3810',
        gstin: app?.gstin || sessionObj?.gstin || '29ABCDE1234F1Z5',
        proprietor: sessionObj?.name || parsedStoreSaved?.proprietor || app?.proprietorName || 'Aura Trends',
        defaultMargin: parsedStoreSaved?.defaultMargin || 45, // 45% default profit margin
        autoSyncStock: true,
        autoSyncPrice: true,
        lastSyncTime: 'Just now',
      };

      if (parsedStoreSaved && (parsedStoreSaved.storeName?.toLowerCase().includes('sharma') || parsedStoreSaved.storeUrl?.toLowerCase().includes('sharma'))) {
        localStorage.setItem('meesho_connected_store', JSON.stringify(storeObj));
      }

      return storeObj;
    } catch {
      return {
        isConnected: true,
        storeName: 'Aura Trends',
        storeUrl: 'auratrends.shop',
        fullStoreUrl: 'https://auratrends.shop',
        platform: 'Shopify',
        capacity: '50 - 200 orders/month',
        pan: 'ABCDE1234F',
        aadhaar: '4829 1920 3810',
        gstin: '29ABCDE1234F1Z5',
        proprietor: 'Aura Trends',
        defaultMargin: 45,
        autoSyncStock: true,
        autoSyncPrice: true,
        lastSyncTime: 'Just now',
      };
    }
  });

  // Auto-clean any legacy or mock Sharma data on mount
  useEffect(() => {
    try {
      const sess = localStorage.getItem('meesho_dropshipper_session');
      if (sess) {
        const p = JSON.parse(sess);
        if (p.brandName?.toLowerCase().includes('sharma') || p.storeUrl?.toLowerCase().includes('sharma') || p.name?.toLowerCase().includes('rajesh')) {
          p.name = 'Aura Trends';
          p.brandName = 'Aura Trends';
          p.storeUrl = 'https://auratrends.shop';
          p.platform = 'Shopify';
          localStorage.setItem('meesho_dropshipper_session', JSON.stringify(p));
          setSession(p);
        }
      }
      const st = localStorage.getItem('meesho_connected_store');
      if (st) {
        const sp = JSON.parse(st);
        if (sp.storeName?.toLowerCase().includes('sharma') || sp.storeUrl?.toLowerCase().includes('sharma')) {
          sp.storeName = 'Aura Trends';
          sp.storeUrl = 'auratrends.shop';
          sp.fullStoreUrl = 'https://auratrends.shop';
          sp.platform = 'Shopify';
          localStorage.setItem('meesho_connected_store', JSON.stringify(sp));
          setConnectedStore((prev) => ({ ...prev, ...sp }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [syncedProducts, setSyncedProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('meesho_synced_products');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      1: {
        synced: true,
        storePrice: 699,
        lastSynced: 'Just now',
        storeName: 'Aura Trends Luxe',
        platform: 'Shopify',
      },
      2: {
        synced: true,
        storePrice: 799,
        lastSynced: 'Just now',
        storeName: 'Aura Trends Luxe',
        platform: 'Shopify',
      },
    };
  });

  const updateSyncedProducts = (updater) => {
    setSyncedProducts((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem('meesho_synced_products', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleRemoveFromStore = (productId) => {
    updateSyncedProducts((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    triggerToast(`🗑️ Product removed from ${connectedStore.storeName} storefront.`);
  };

  const [storeCatalogOpen, setStoreCatalogOpen] = useState(false);

  const [syncModalProduct, setSyncModalProduct] = useState(null);
  const [syncResalePrice, setSyncResalePrice] = useState('');
  const [syncCollection, setSyncCollection] = useState('Ethnic Festive Wear');
  const [syncAutoStock, setSyncAutoStock] = useState(true);
  const [syncAutoPrice, setSyncAutoPrice] = useState(true);
  const [syncPublishActive, setSyncPublishActive] = useState(true);
  const [syncStage, setSyncStage] = useState(0); // 0: config, 1: media, 2: variants, 3: completed
  const [isSyncing, setIsSyncing] = useState(false);
  const [storeSettingsOpen, setStoreSettingsOpen] = useState(false);

  // Live Storefront Customer View Modal state
  const [storePreviewProduct, setStorePreviewProduct] = useState(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [previewSelectedSize, setPreviewSelectedSize] = useState('M');
  const [previewQuantity, setPreviewQuantity] = useState(1);

  const handleOpenStorePreview = (prod) => {
    setStorePreviewProduct(prod);
    setPreviewImageIndex(0);
  };

  // List of all products synced to Aura Trends Luxe
  const storeSyncedProductsList = useMemo(() => {
    return SUPPLIER_PRODUCTS.filter((p) => Boolean(syncedProducts[p.id]?.synced));
  }, [syncedProducts]);

  // Show Toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Dynamic Stock Counts based on search and category
  const stockCounts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const baseList = SUPPLIER_PRODUCTS.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.supplier.name.toLowerCase().includes(q) ||
        p.supplier.location.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesQuery && matchesCat;
    });

    return {
      all: baseList.length,
      in_stock: baseList.filter((p) => p.stockStatus === 'in_stock' || p.stockStatus === 'low_stock' || (p.stock && p.stock > 0)).length,
      out_of_stock: baseList.filter((p) => p.stockStatus === 'out_of_stock' || p.stock === 0).length,
      fast_dispatch: baseList.filter((p) => Boolean(p.fastDispatch)).length,
      store_synced: baseList.filter((p) => Boolean(syncedProducts[p.id]?.synced)).length,
    };
  }, [searchQuery, selectedCategory, syncedProducts]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return SUPPLIER_PRODUCTS.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.supplier.name.toLowerCase().includes(q) ||
        p.supplier.location.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;

      let matchesStock = true;
      if (stockFilter === 'in_stock') {
        matchesStock = p.stockStatus === 'in_stock' || p.stockStatus === 'low_stock' || (p.stock && p.stock > 0);
      } else if (stockFilter === 'out_of_stock') {
        matchesStock = p.stockStatus === 'out_of_stock' || p.stock === 0;
      } else if (stockFilter === 'low_stock') {
        matchesStock = p.stockStatus === 'low_stock';
      } else if (stockFilter === 'fast_dispatch') {
        matchesStock = Boolean(p.fastDispatch);
      } else if (stockFilter === 'store_synced') {
        matchesStock = Boolean(syncedProducts[p.id]?.synced);
      }

      return matchesQuery && matchesCat && matchesStock;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.supplierPrice - b.supplierPrice;
      if (sortBy === 'price_high') return b.supplierPrice - a.supplierPrice;
      if (sortBy === 'margin_high') {
        const marginA = a.suggestedResale - a.supplierPrice;
        const marginB = b.suggestedResale - b.supplierPrice;
        return marginB - marginA;
      }
      return b.supplier.rating - a.supplier.rating; // default: popular/rating
    });
  }, [searchQuery, selectedCategory, stockFilter, sortBy, syncedProducts]);

  // Open Detailed Product Inspector Modal
  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    setResaleInput(product.suggestedResale.toString());
    setActiveImageIndex(0);
  };

  // 1-Click Copy Description
  const handleCopyDescription = (product) => {
    const text = `🛍️ ${product.name}\n\n📦 SKU: ${product.sku}\n🏷️ Retail Price: ₹${
      selectedProduct?.id === product.id ? resaleInput || product.suggestedResale : product.suggestedResale
    }\n\n✨ Specifications:\n${Object.entries(product.specs)
      .map(([k, v]) => `• ${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
      .join('\n')}\n\n📝 Details:\n${product.description}\n\n🚚 Delivery: Free Delivery | 7-Day Easy Returns\n💬 Reply with your delivery address to order now!`;

    navigator.clipboard.writeText(text);
    triggerToast('✅ Full product description & specs copied to clipboard!');
  };

  // Download Media Kit
  const handleDownloadMedia = (product) => {
    triggerToast(`📥 Downloading ${product.images.length} HD images & spec sheet for ${product.sku}...`);
  };

  // 1-Click Sync Handlers
  const handleOpenSyncModal = (product) => {
    setSyncModalProduct(product);
    const calculatedPrice = Math.round(product.supplierPrice * (1 + connectedStore.defaultMargin / 100));
    setSyncResalePrice(calculatedPrice.toString());
    setSyncStage(0);
    setIsSyncing(false);
  };

  const handleExecutePublish = () => {
    if (!syncModalProduct) return;
    setIsSyncing(true);
    setSyncStage(1); // Uploading HD media to Aura Trends Luxe Shopify store

    setTimeout(() => {
      setSyncStage(2); // Generating SKU variants matrix & Shopify webhooks
    }, 600);

    setTimeout(() => {
      setSyncStage(3); // Setting margin & activating live listing on https://auratrends.shop
      setIsSyncing(false);
      const price = Number(syncResalePrice) || syncModalProduct.suggestedResale;
      updateSyncedProducts((prev) => ({
        ...prev,
        [syncModalProduct.id]: {
          synced: true,
          storePrice: price,
          lastSynced: 'Just now',
          storeName: connectedStore.storeName,
          platform: connectedStore.platform,
        },
      }));
      triggerToast(`⚡ Published to ${connectedStore.storeName} (${connectedStore.fullStoreUrl})! Live 2-way Shopify stock sync active.`);
    }, 1400);
  };

  const handleSimulateStockAutoSync = () => {
    triggerToast(`⚡ Real-Time Auto-Sync: Supplier inventory updated. ${Object.keys(syncedProducts).length} live SKUs synced to ${connectedStore.storeName} (Shopify • ${connectedStore.storeUrl}) in 0.8s!`);
  };

  // WhatsApp Share with custom pricing
  const handleShareWhatsApp = (product) => {
    const priceToShare = selectedProduct?.id === product.id ? resaleInput || product.suggestedResale : product.suggestedResale;
    const msg = `✨ *${product.name}* ✨\n\n💰 *Price:* ₹${priceToShare} Only (COD Available)\n📦 *SKU:* ${product.sku}\n🚚 *Shipping:* Free Home Delivery across India\n🔄 *Return:* 7-Day Hassle-Free Returns\n\n*Product Highlights:*\n${product.description}\n\n📲 *Reply here with your Name & Delivery PIN code to place order!*`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen pb-28 font-sans selection:bg-[#b90041]/20 w-full overflow-x-hidden">
      <NavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* Floating Toast Notice */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[999999] bg-gray-900/95 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md border border-gray-700 animate-in fade-in slide-in-from-top-4 duration-200 max-w-[90vw] text-center">
          <span className="material-symbols-outlined text-emerald-400 text-base shrink-0">check_circle</span>
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP HEADER & PORTAL STATUS BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2">
          {/* Left: Menu & Brand Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open Navigation Menu"
              className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-xl transition cursor-pointer text-gray-700 active:scale-95 shrink-0"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">menu</span>
            </button>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <span className="text-base sm:text-xl font-extrabold text-[#FF3F6C] font-['Plus_Jakarta_Sans'] tracking-tight whitespace-nowrap">
                Meesho Direct
              </span>
              <span className="bg-[#b90041]/10 text-[#b90041] text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border border-[#b90041]/20 uppercase tracking-wide whitespace-nowrap">
                B2B <span className="hidden sm:inline">Supplier Access</span>
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* User Session Chip (Compact on mobile) */}
            <div
              onClick={() => setProfileModalOpen(true)}
              title="Click to View Verified Dropshipper Account Details"
              className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl px-2 py-1 flex items-center gap-1.5 shadow-xs cursor-pointer transition active:scale-95 shrink-0"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <div className="text-left leading-tight">
                <div className="text-[10px] sm:text-xs text-emerald-800 font-bold uppercase tracking-wider truncate max-w-[75px] xs:max-w-[100px] sm:max-w-[140px]">
                  {session?.name || 'Aura Trends'}
                </div>
                <div className="text-[8px] text-emerald-600 font-mono hidden md:block">
                  {session?.dropshipperId || 'DS-ID: #89420'}
                </div>
              </div>
            </div>

            {/* Store Products Live Catalog Button */}
            <button
              onClick={() => setStoreCatalogOpen(true)}
              title={`View all products live on ${connectedStore.storeName} (${connectedStore.platform})`}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-sm">storefront</span>
              <span className="hidden md:inline">Store Products</span>
              <span className="bg-emerald-950/40 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-emerald-400/30">
                {Object.keys(syncedProducts).length}
              </span>
            </button>

            {/* Connected Store Chip - Hidden on small mobile screens to prevent overflow, visible on lg screens */}
            <div
              onClick={() => setStoreSettingsOpen(true)}
              title={`Configure ${connectedStore.storeName} (${connectedStore.platform}) Store`}
              className="hidden lg:flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-200/90 rounded-xl px-2 sm:px-2.5 py-1 shadow-xs cursor-pointer transition active:scale-95 shrink-0"
            >
              <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shadow-xs shrink-0">
                <span className="material-symbols-outlined text-xs">storefront</span>
              </div>
              <div className="text-left leading-tight">
                <div className="text-[10px] text-purple-950 font-black flex items-center gap-1">
                  <span className="truncate max-w-[95px] sm:max-w-[135px]">{connectedStore.storeName || 'Aura Trends'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                </div>
                <div className="text-[9px] text-purple-700 font-mono flex items-center gap-1">
                  <span className="bg-purple-200/80 text-purple-950 text-[8px] font-extrabold px-1 rounded">{connectedStore.platform || 'Shopify'}</span>
                  <span className="truncate max-w-[80px] sm:max-w-[110px]">{connectedStore.storeUrl || 'auratrends.shop'}</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-xs text-purple-600 shrink-0">tune</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to switch or log out of your dropshipper account?')) {
                  localStorage.removeItem('meesho_dropshipper_session');
                  navigate('/dropshipper-login');
                }
              }}
              title="Logout / Switch Account"
              className="p-1 sm:p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-base sm:text-lg">logout</span>
            </button>
          </div>
        </div>

        {/* 2. STATS & ACCESS OVERVIEW STRIP */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 text-white px-3 sm:px-6 py-2 border-t border-gray-800">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 sm:gap-2.5 text-xs">
            <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-gray-300 text-[11px] sm:text-xs">
              <div className="flex items-center gap-1 shrink-0">
                <span className="material-symbols-outlined text-emerald-400 text-sm">verified</span>
                <span>Suppliers: <strong className="text-white">1,240+</strong></span>
              </div>
              <div className="hidden sm:flex items-center gap-1 shrink-0">
                <span className="material-symbols-outlined text-blue-400 text-sm">inventory</span>
                <span>Live SKUs: <strong className="text-white">85,000+</strong></span>
              </div>
              {/* 2-Way Auto Sync Live Indicator & Store Catalog Click */}
              <div
                onClick={() => setStoreCatalogOpen(true)}
                className="flex items-center gap-1.5 bg-gray-800/90 hover:bg-gray-750 px-2 sm:px-2.5 py-1 rounded-lg border border-gray-700 text-[10px] sm:text-[11px] cursor-pointer transition active:scale-95 shrink-0 max-w-full"
                title={`Click to view all live products on ${connectedStore.storeName} (${connectedStore.platform})`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
                <span className="truncate max-w-[130px] sm:max-w-none">
                  Sync to <strong className="text-emerald-300 font-bold">{connectedStore.storeName}</strong>:
                </span>
                <span className="text-emerald-400 font-semibold shrink-0">Active</span>
                <span className="text-gray-300 font-semibold shrink-0">
                  ({Object.keys(syncedProducts).length} on {connectedStore.platform})
                </span>
                <span className="material-symbols-outlined text-xs text-emerald-300 shrink-0">open_in_new</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSimulateStockAutoSync();
                  }}
                  className="text-[9px] sm:text-[10px] text-pink-300 hover:text-white underline cursor-pointer ml-0.5 shrink-0"
                  title="Simulate real-time supplier inventory event"
                >
                  Test
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-2 text-gray-400 text-[10px] sm:text-[11px] pt-1 md:pt-0 border-t md:border-0 border-gray-800">
              <span className="truncate">
                Platform: <strong className="text-white">{connectedStore.platform}</strong> ({connectedStore.capacity})
              </span>
              <button
                onClick={() => setStoreSettingsOpen(true)}
                className="text-pink-300 hover:text-white underline cursor-pointer shrink-0 font-medium ml-2"
              >
                Store Settings →
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3. SEARCH & CONTROLS TOOLBAR */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5 space-y-3">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-xs space-y-2.5 sm:space-y-3">
          {/* Row 1: Search Box & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center justify-between">
            {/* Search Box */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg sm:text-xl pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Product Name, SKU, Supplier..."
                className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#b90041]/30 focus:border-[#b90041] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 sm:shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-gray-50 border border-gray-200 text-xs font-semibold rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#b90041]/30 cursor-pointer"
              >
                <option value="popular">Top Rated Suppliers</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="margin_high">Highest Margin Profit</option>
              </select>
            </div>
          </div>

          {/* Row 2: Stock Status Filter Bar (Scrollable horizontally with no-scrollbar) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs -mx-1 px-1">
            <button
              type="button"
              onClick={() => setStockFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                stockFilter === 'all'
                  ? 'bg-white text-gray-900 shadow-xs font-bold ring-1 ring-black/10'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>All Stock</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  stockFilter === 'all' ? 'bg-gray-200 text-gray-800' : 'bg-gray-200/80 text-gray-500'
                }`}
              >
                {stockCounts.all}
              </span>
            </button>

            {/* Filter: Live on Aura Trends Luxe */}
            <button
              type="button"
              onClick={() => setStockFilter('store_synced')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                stockFilter === 'store_synced'
                  ? 'bg-purple-700 text-white shadow-xs font-bold'
                  : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <span className="material-symbols-outlined text-xs">storefront</span>
              <span>Live on {connectedStore.storeName}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  stockFilter === 'store_synced' ? 'bg-purple-900 text-white' : 'bg-purple-200 text-purple-950'
                }`}
              >
                {stockCounts.store_synced}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStockFilter('in_stock')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                stockFilter === 'in_stock'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>In Stock Only</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  stockFilter === 'in_stock' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {stockCounts.in_stock}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStockFilter('out_of_stock')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                stockFilter === 'out_of_stock'
                  ? 'bg-red-600 text-white shadow-xs font-bold'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>Out of Stock</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  stockFilter === 'out_of_stock' ? 'bg-red-700 text-white' : 'bg-red-100 text-red-700'
                }`}
              >
                {stockCounts.out_of_stock}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStockFilter('fast_dispatch')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                stockFilter === 'fast_dispatch'
                  ? 'bg-[#b90041] text-white shadow-xs font-bold'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>⚡ &lt; 24h Dispatch</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  stockFilter === 'fast_dispatch' ? 'bg-[#990036] text-white' : 'bg-pink-100 text-[#b90041]'
                }`}
              >
                {stockCounts.fast_dispatch}
              </span>
            </button>
          </div>

          {/* Row 3: Category Chips Bar (Scrollable horizontally with no-scrollbar) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar text-xs -mx-1 px-1">
            <span className="text-gray-400 font-semibold uppercase text-[10px] shrink-0 tracking-wider">
              Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 sm:px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer font-medium text-xs shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#b90041] text-white shadow-xs font-bold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 4. ACTIVE RESULTS SUMMARY */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-500 px-1">
          <div>
            Showing <strong className="text-gray-900 font-bold">{filteredProducts.length}</strong> supplier verified products ready for dropshipping
          </div>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setStockFilter('all');
              }}
              className="text-[#b90041] hover:underline font-semibold cursor-pointer shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* 5. PRODUCT CATALOG GRID */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((p) => {
              const estimatedProfit = p.suggestedResale - p.supplierPrice;
              const profitPercentage = Math.round((estimatedProfit / p.suggestedResale) * 100);

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group"
                >
                  {/* Image Container with Badges */}
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Stock Status Badge */}
                    <div className="absolute top-2.5 left-2.5 max-w-[55%]">
                      {p.stockStatus === 'in_stock' && (
                        <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0"></span>
                          <span className="truncate">In Stock ({p.stock})</span>
                        </span>
                      )}
                      {p.stockStatus === 'low_stock' && (
                        <span className="bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs truncate">
                          <span className="material-symbols-outlined text-[12px] shrink-0">warning</span>
                          <span className="truncate">Only {p.stock} left!</span>
                        </span>
                      )}
                      {p.stockStatus === 'out_of_stock' && (
                        <span className="bg-red-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md truncate">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* SKU Badge */}
                    <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shadow-xs max-w-[42%] truncate">
                      SKU: {p.sku}
                    </div>

                    {/* Dispatch SLA Chip */}
                    {p.fastDispatch && (
                      <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs max-w-[52%] truncate">
                        <span className="material-symbols-outlined text-amber-500 text-xs shrink-0">bolt</span>
                        <span className="truncate">{p.supplier.dispatchTime}</span>
                      </div>
                    )}

                    {/* Store Sync Status Badge on Card Image */}
                    <div className="absolute bottom-2.5 right-2.5 max-w-[50%] truncate">
                      {p.stockStatus === 'out_of_stock' ? (
                        <span className="bg-red-950/80 backdrop-blur-md text-red-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-red-500/30 truncate">
                          <span className="material-symbols-outlined text-xs shrink-0">hourglass_empty</span>
                          <span className="truncate">Restocking</span>
                        </span>
                      ) : syncedProducts[p.id]?.synced ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenStorePreview(p);
                          }}
                          className="bg-emerald-700/90 hover:bg-emerald-800 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs border border-emerald-400/30 cursor-pointer transition truncate"
                          title={`Click to preview on ${connectedStore.storeName}`}
                        >
                          <span className="material-symbols-outlined text-xs shrink-0">storefront</span>
                          <span className="truncate">Live on {connectedStore.storeName}</span>
                        </button>
                      ) : (
                        <span className="bg-black/60 backdrop-blur-md text-gray-300 text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 truncate">
                          <span className="material-symbols-outlined text-xs text-purple-400 shrink-0">sync</span>
                          <span className="truncate">Ready for {connectedStore.storeName}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {/* Supplier Meta */}
                      <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                        <span className="flex items-center gap-1 font-semibold text-gray-700 truncate max-w-[180px]">
                          <span className="material-symbols-outlined text-emerald-600 text-xs">verified</span>
                          {p.supplier.name}
                        </span>
                        <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                          <span className="material-symbols-outlined text-xs">star</span>
                          {p.supplier.rating} ({p.supplier.reviewsCount})
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => handleOpenProduct(p)}
                        className="font-bold text-sm text-gray-900 line-clamp-1 hover:text-[#b90041] transition cursor-pointer font-['Plus_Jakarta_Sans']"
                      >
                        {p.name}
                      </h3>

                      {/* Brief description snippet */}
                      <p className="text-gray-500 text-xs line-clamp-2 mt-1 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    {/* Pricing Matrix Box */}
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
                            Supplier Rate
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-black text-gray-900">₹{p.supplierPrice}</span>
                            <span className="text-xs text-gray-400 line-through">₹{p.mrp}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
                            Reseller Profit
                          </span>
                          <div className="text-sm font-extrabold text-emerald-600 flex items-center justify-end gap-1">
                            <span>+₹{estimatedProfit}</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-mono">
                              {profitPercentage}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Suggested Resale Tag */}
                      <div className="pt-1.5 border-t border-gray-200/70 flex items-center justify-between text-[11px]">
                        <span className="text-gray-500">Rec. Customer Price:</span>
                        <span className="font-bold text-gray-800">₹{p.suggestedResale}</span>
                      </div>
                    </div>

                    {/* Action Buttons: Sync & Store Actions */}
                    <div className="space-y-2 pt-1">
                      {p.stockStatus === 'out_of_stock' ? (
                        <button
                          type="button"
                          onClick={() => triggerToast(`🔔 Restock alert activated for SKU: ${p.sku}! We will alert you on WhatsApp.`)}
                          className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                        >
                          <span className="material-symbols-outlined text-sm">notifications_active</span>
                          <span>Notify When Restocked</span>
                        </button>
                      ) : syncedProducts[p.id]?.synced ? (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleOpenStorePreview(p)}
                            className="w-full py-2 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-xs transition cursor-pointer active:scale-95"
                            title={`Open Live Customer View on ${connectedStore.storeName}`}
                          >
                            <span className="material-symbols-outlined text-sm">storefront</span>
                            <span>View on Store</span>
                          </button>
                          <button
                            onClick={() => handleOpenSyncModal(p)}
                            className="w-full py-2 px-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition cursor-pointer active:scale-95"
                          >
                            <span className="material-symbols-outlined text-sm">tune</span>
                            <span>Re-Sync Price</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenSyncModal(p)}
                          className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                        >
                          <span className="material-symbols-outlined text-sm">sync_alt</span>
                          <span>⚡ 1-Click Sync to {connectedStore.storeName}</span>
                        </button>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleOpenProduct(p)}
                          className="w-full py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition cursor-pointer active:scale-95"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          <span>Full Specs</span>
                        </button>

                        <button
                          onClick={() => handleShareWhatsApp(p)}
                          className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition shadow-xs cursor-pointer active:scale-95"
                        >
                          <span className="material-symbols-outlined text-sm">share</span>
                          <span>Share & Earn</span>
                        </button>
                      </div>
                    </div>

                    {/* Copy Description Quick Bar */}
                    <div className="flex items-center justify-between text-[11px] pt-1 text-gray-500">
                      <button
                        onClick={() => handleCopyDescription(p)}
                        className="hover:text-[#b90041] flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <span className="material-symbols-outlined text-xs">content_copy</span>
                        <span>Copy Description</span>
                      </button>
                      <button
                        onClick={() => handleDownloadMedia(p)}
                        className="hover:text-[#b90041] flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <span className="material-symbols-outlined text-xs">download</span>
                        <span>Media Kit ({p.images.length})</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : stockFilter === 'store_synced' ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-200 shadow-xs max-w-xl mx-auto space-y-3">
            <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">storefront</span>
            </div>
            <h3 className="text-base font-extrabold text-gray-900">
              Abhi {connectedStore.storeName} par koi product sync nahi hai
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              Supplier catalog me kisi bhi product ke neeche <strong>"⚡ 1-Click Sync to {connectedStore.storeName}"</strong> button dabakar product turant apne store par live karein!
            </p>
            <button
              onClick={() => setStockFilter('all')}
              className="px-4 py-2 bg-[#b90041] hover:bg-[#a00037] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Browse All Supplier Products
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-xs max-w-xl mx-auto space-y-3">
            <span className="material-symbols-outlined text-5xl text-gray-300">inventory_2</span>
            <h3 className="text-base font-bold text-gray-800">No Supplier Products Found</h3>
            <p className="text-xs text-gray-500">
              Try adjusting your search query, selecting "All Categories", or turning off stock filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setStockFilter('all');
              }}
              className="px-4 py-2 bg-[#b90041] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#a00037] transition cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* 6. FULL PRODUCT DETAILS & SPECIFICATIONS MODAL */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-[2rem] sm:rounded-3xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-2">
                <span className="bg-[#b90041]/10 text-[#b90041] font-mono text-xs font-bold px-2 py-0.5 rounded-md">
                  {selectedProduct.sku}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-600 font-semibold">{selectedProduct.category}</span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Col: Images & Media Preview (5 cols) */}
                <div className="md:col-span-5 space-y-3">
                  <div className="aspect-[4/3] rounded-2xl bg-gray-100 overflow-hidden border border-gray-200 relative">
                    <img
                      src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                      Image {activeImageIndex + 1} of {selectedProduct.images.length}
                    </div>
                  </div>

                  {/* Thumbnail Row */}
                  <div className="flex items-center gap-2">
                    {selectedProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                          activeImageIndex === idx ? 'border-[#b90041] scale-95' : 'border-gray-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                    <button
                      onClick={() => handleDownloadMedia(selectedProduct)}
                      className="flex-1 h-14 rounded-xl border border-dashed border-gray-300 hover:border-[#b90041] hover:bg-[#b90041]/5 flex flex-col items-center justify-center text-[10px] text-gray-600 font-bold transition cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base text-[#b90041]">file_download</span>
                      <span>Download HD</span>
                    </button>
                  </div>

                  {/* Supplier Verification Card */}
                  <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{selectedProduct.supplier.name}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                        Verified Partner
                      </span>
                    </div>
                    <div className="text-gray-500 text-[11px] space-y-0.5">
                      <div>📍 Hub: {selectedProduct.supplier.location}</div>
                      <div>⚡ Dispatch: {selectedProduct.supplier.dispatchTime}</div>
                      <div>🔄 Returns: {selectedProduct.supplier.returnPolicy}</div>
                      <div>📊 Risk Rating: {selectedProduct.supplier.rtoScore}</div>
                      <div>📦 Dropship MOQ: {selectedProduct.supplier.moq}</div>
                    </div>
                  </div>
                </div>

                {/* Right Col: Specifications, Stock & Margin Calculator (7 cols) */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans'] leading-snug">
                      {selectedProduct.name}
                    </h2>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                      {selectedProduct.description}
                    </p>
                  </div>

                  {/* Out of Stock Notice */}
                  {selectedProduct.stockStatus === 'out_of_stock' && (
                    <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs flex items-center justify-between gap-2 shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-600 text-base">inventory_2</span>
                        <span>
                          <strong className="font-bold">Currently Out of Stock:</strong> Next batch expected in 3–5 days.
                        </span>
                      </div>
                      <span className="text-[10px] bg-red-200 text-red-900 font-bold px-2 py-0.5 rounded-full shrink-0">
                        0 Units Left
                      </span>
                    </div>
                  )}

                  {/* Pricing and Profit Calculator Box */}
                  <div className="bg-gradient-to-br from-pink-50/70 to-rose-50/40 p-4 rounded-2xl border border-pink-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#b90041] uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calculate</span>
                        Live Margin & Resale Calculator
                      </span>
                      <span className="text-[11px] text-gray-500">Supplier Price: <strong>₹{selectedProduct.supplierPrice}</strong></span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <label htmlFor="customerPriceInput" className="font-semibold text-gray-700">
                          Your Customer Selling Price (₹):
                        </label>
                        <span className="font-mono text-gray-400 text-[10px]">MSRP: ₹{selectedProduct.mrp}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          id="customerPriceInput"
                          type="number"
                          value={resaleInput}
                          onChange={(e) => setResaleInput(e.target.value)}
                          className="w-32 px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b90041]"
                        />
                        <div className="flex-1">
                          <input
                            type="range"
                            min={selectedProduct.supplierPrice}
                            max={selectedProduct.mrp}
                            value={Number(resaleInput) || selectedProduct.suggestedResale}
                            onChange={(e) => setResaleInput(e.target.value)}
                            className="w-full accent-[#b90041] cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Profit Calculation Summary */}
                    {(() => {
                      const num = Number(resaleInput) || selectedProduct.suggestedResale;
                      const profit = Math.max(0, num - selectedProduct.supplierPrice);
                      const marginPct = Math.round((profit / num) * 100) || 0;
                      return (
                        <div className="bg-white p-3 rounded-xl border border-pink-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-gray-500 block uppercase font-bold">Your Direct Profit / Piece</span>
                            <span className="text-2xl font-black text-emerald-600">₹{profit}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-gray-500 block uppercase font-bold">Margin Percentage</span>
                            <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              {marginPct}% Margin
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Variant & SKU Inventory Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-800">Variant Inventory & SKU Matrix</span>
                      <span className="text-[11px] text-gray-500">
                        Total Stock: <strong className="text-gray-900">{selectedProduct.stock} units</strong>
                      </span>
                    </div>

                    <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
                          <tr>
                            <th className="p-2.5">Variant / Size</th>
                            <th className="p-2.5">SKU Code</th>
                            <th className="p-2.5 text-right">Available Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedProduct.variants.map((v, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="p-2.5 font-bold text-gray-800">{v.size}</td>
                              <td className="p-2.5 font-mono text-gray-500 text-[11px]">{v.sku}</td>
                              <td className="p-2.5 text-right font-semibold">
                                {v.stock > 0 ? (
                                  <span className="text-emerald-700 font-bold">{v.stock} units</span>
                                ) : (
                                  <span className="text-red-500 font-bold">Out of Stock</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Specifications Grid */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-800">Technical Specifications</span>
                      <button
                        onClick={() => handleCopyDescription(selectedProduct)}
                        className="text-[#b90041] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">content_copy</span>
                        <span>Copy All Details</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 text-[11px]">
                      {Object.entries(selectedProduct.specs).map(([key, val]) => (
                        <div key={key} className="space-y-0.5">
                          <span className="text-gray-400 capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <div className="font-semibold text-gray-800">{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Footer Actions */}
            <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 shrink-0">
              {/* Desktop Layout (sm and up) */}
              <div className="hidden sm:flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyDescription(selectedProduct)}
                    className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                    <span>Copy Text</span>
                  </button>
                  <button
                    onClick={() => handleDownloadMedia(selectedProduct)}
                    className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Download Media</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {selectedProduct.stockStatus === 'out_of_stock' ? (
                    <button
                      type="button"
                      onClick={() => triggerToast(`🔔 Restock alert activated for SKU: ${selectedProduct.sku}!`)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">notifications_active</span>
                      <span>Notify Restock</span>
                    </button>
                  ) : syncedProducts[selectedProduct.id]?.synced ? (
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        handleOpenStorePreview(selectedProduct);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">storefront</span>
                      <span>View on Store</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenSyncModal(selectedProduct)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">sync_alt</span>
                      <span>1-Click Sync to {connectedStore.storeName}</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleShareWhatsApp(selectedProduct)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">share</span>
                    <span>WhatsApp</span>
                  </button>
                  <button
                    disabled={selectedProduct.stockStatus === 'out_of_stock'}
                    onClick={() => setOrderModalOpen(true)}
                    className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 ${
                      selectedProduct.stockStatus === 'out_of_stock'
                        ? 'bg-gray-400 cursor-not-allowed opacity-60'
                        : 'bg-[#b90041] hover:bg-[#a00037] cursor-pointer active:scale-95'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">shopping_cart_checkout</span>
                    <span>Place Order</span>
                  </button>
                </div>
              </div>

              {/* Mobile Layout (< sm screens) */}
              <div className="sm:hidden space-y-2">
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleCopyDescription(selectedProduct)}
                    className="py-1.5 px-2 bg-white border border-gray-300 text-gray-700 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 active:scale-95 transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => handleDownloadMedia(selectedProduct)}
                    className="py-1.5 px-2 bg-white border border-gray-300 text-gray-700 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 active:scale-95 transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Media</span>
                  </button>
                  <button
                    onClick={() => handleShareWhatsApp(selectedProduct)}
                    className="py-1.5 px-2 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 active:scale-95 transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm text-emerald-600">share</span>
                    <span>Share</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {syncedProducts[selectedProduct.id]?.synced ? (
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        handleOpenStorePreview(selectedProduct);
                      }}
                      className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-xs active:scale-95 transition cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">storefront</span>
                      <span>Store Preview</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenSyncModal(selectedProduct)}
                      className="py-2.5 px-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-xs active:scale-95 transition cursor-pointer truncate"
                    >
                      <span className="material-symbols-outlined text-sm">sync_alt</span>
                      <span className="truncate">Sync to {connectedStore.storeName}</span>
                    </button>
                  )}
                  <button
                    disabled={selectedProduct.stockStatus === 'out_of_stock'}
                    onClick={() => setOrderModalOpen(true)}
                    className={`py-2.5 px-2 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1 ${
                      selectedProduct.stockStatus === 'out_of_stock'
                        ? 'bg-gray-400 cursor-not-allowed opacity-60'
                        : 'bg-[#b90041] hover:bg-[#a00037] active:scale-95 cursor-pointer'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">shopping_cart_checkout</span>
                    <span>{selectedProduct.stockStatus === 'out_of_stock' ? 'Out of Stock' : 'Order Now'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. PLACE DROPSHIP ORDER MODAL */}
      {orderModalOpen && selectedProduct && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setOrderModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-4 sm:p-5 shrink-0">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 font-['Plus_Jakarta_Sans']">
                  Direct Dropship Order Placement
                </h3>
                <p className="text-xs text-gray-500">Shipped directly from supplier to your customer's doorstep</p>
              </div>
              <button
                onClick={() => setOrderModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1">
                <div className="font-bold text-gray-800">{selectedProduct.name}</div>
                <div className="text-gray-500 font-mono">SKU: {selectedProduct.sku} • Supplier Rate: ₹{selectedProduct.supplierPrice}</div>
                <div className="text-emerald-700 font-bold">
                  Your Selling Price: ₹{resaleInput || selectedProduct.suggestedResale} (Net Margin: +₹{(Number(resaleInput) || selectedProduct.suggestedResale) - selectedProduct.supplierPrice})
                </div>
              </div>

              {/* Mock Customer Shipping Form */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Customer Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b90041]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Customer Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b90041]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Complete Delivery Address & PIN Code</label>
                  <textarea
                    rows={2}
                    placeholder="House no, Street name, Landmark, City, State, PIN Code"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b90041]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Select Variant / Size</label>
                  <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b90041] cursor-pointer">
                    {selectedProduct.variants.map((v, i) => (
                      <option key={i} value={v.sku} disabled={v.stock === 0}>
                        {v.size} ({v.sku}) — {v.stock > 0 ? `${v.stock} in stock` : 'Out of stock'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0 flex items-center justify-end gap-2">
              <button
                onClick={() => setOrderModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setOrderModalOpen(false);
                  setSelectedProduct(null);
                  triggerToast(`🎉 Order booked! Dispatched from ${selectedProduct.supplier.name} warehouse.`);
                }}
                className="px-5 py-2 bg-[#b90041] hover:bg-[#a00037] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                Confirm & Dispatch Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. ONE-CLICK PRODUCT SYNC MODAL */}
      {/* 8. ONE-CLICK PRODUCT SYNC MODAL */}
      {syncModalProduct && (
        <div
          className="fixed inset-0 z-[1150] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            if (!isSyncing) setSyncModalProduct(null);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-4 sm:p-5 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">sync_alt</span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base text-gray-900 font-['Plus_Jakarta_Sans'] truncate">
                    1-Click Publish to {connectedStore.storeName}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 truncate flex items-center gap-1.5 flex-wrap">
                    <span>Shopify Storefront:</span>
                    <strong className="text-purple-700 font-mono">{connectedStore.fullStoreUrl}</strong>
                    <span className="text-gray-400">•</span>
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded text-[10px] font-bold">
                      {connectedStore.capacity}
                    </span>
                  </p>
                </div>
              </div>
              {!isSyncing && (
                <button
                  onClick={() => setSyncModalProduct(null)}
                  className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>

            {/* Scrollable Modal Body */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
              {/* Product Snapshot */}
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                <img
                  src={syncModalProduct.images[0]}
                  alt={syncModalProduct.name}
                  className="w-14 sm:w-16 h-14 sm:h-16 rounded-xl object-cover shrink-0 border border-gray-200"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <h4 className="font-bold text-gray-900 truncate">{syncModalProduct.name}</h4>
                  <div className="text-gray-500 font-mono text-[11px] mt-0.5">
                    SKU: {syncModalProduct.sku} • {syncModalProduct.variants.length} Variants
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1">
                    Supplier Rate: <strong className="text-gray-900 font-bold">₹{syncModalProduct.supplierPrice}</strong>
                  </div>
                </div>
              </div>

              {/* Sync Progress Animation (During Sync Execution) */}
              {isSyncing || syncStage === 3 ? (
                <div className="py-6 space-y-4 text-center">
                  {syncStage === 1 && (
                    <div className="space-y-3 animate-in fade-in">
                      <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto animate-spin">
                        <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                      </div>
                      <div className="text-sm font-bold text-gray-800">Step 1: Uploading HD Media & Descriptions to {connectedStore.storeName}...</div>
                      <p className="text-xs text-gray-500">Transferring high-res images and technical spec sheet directly to {connectedStore.storeName} Shopify CDN</p>
                    </div>
                  )}
                  {syncStage === 2 && (
                    <div className="space-y-3 animate-in fade-in">
                      <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
                        <span className="material-symbols-outlined text-2xl">account_tree</span>
                      </div>
                      <div className="text-sm font-bold text-gray-800">Step 2: Generating SKU Variants & Linking Shopify Webhooks...</div>
                      <p className="text-xs text-gray-500">Creating S, M, L, XL variants and configuring 2-way real-time stock sync webhooks for {connectedStore.storeName}</p>
                    </div>
                  )}
                  {syncStage === 3 && (
                    <div className="space-y-3 animate-in zoom-in-95">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                        <span className="material-symbols-outlined text-3xl">check_circle</span>
                      </div>
                      <div className="text-base font-extrabold text-gray-900">Successfully Published &amp; Synced!</div>
                      <p className="text-xs text-gray-600">
                        Product is now live on <strong className="text-purple-700">{connectedStore.fullStoreUrl}</strong> at <strong className="text-emerald-700">₹{syncResalePrice}</strong> with automated 2-way Shopify inventory sync enabled.
                      </p>
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            const prod = syncModalProduct;
                            setSyncModalProduct(null);
                            handleOpenStorePreview(prod);
                          }}
                          className="w-full sm:w-auto px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">storefront</span>
                          <span>View on {connectedStore.storeName} (Live Customer View)</span>
                        </button>
                        <button
                          onClick={() => setSyncModalProduct(null)}
                          className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Pre-Publish Configuration Form */
                <div className="space-y-4 text-xs">
                  {/* Verified Store & KYC Identity Card */}
                  <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 rounded-2xl p-3 sm:p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                          <span className="material-symbols-outlined text-base">storefront</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-gray-900 flex items-center gap-1.5 text-xs sm:text-sm truncate">
                            <span className="truncate">{connectedStore.storeName}</span>
                            <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0 shadow-xs">
                              {connectedStore.platform}
                            </span>
                          </div>
                          <div className="text-[11px] text-emerald-800 font-mono flex items-center gap-1 truncate">
                            <span className="material-symbols-outlined text-xs shrink-0">lock</span>
                            <span className="font-semibold truncate">{connectedStore.fullStoreUrl}</span>
                          </div>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        1-Click Sync Ready
                      </span>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/80 grid grid-cols-3 gap-1 text-[10px] font-mono text-gray-700 bg-white/70 p-2 rounded-xl border border-emerald-100">
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase font-sans font-bold">PAN</span>
                        <strong className="text-gray-900 truncate block">{connectedStore.pan}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase font-sans font-bold">Aadhaar</span>
                        <strong className="text-gray-900 truncate block">{connectedStore.aadhaar}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase font-sans font-bold">GSTIN</span>
                        <strong className="text-gray-900 truncate block">{connectedStore.gstin}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Target Store Collection */}
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Target Category / Collection on Your Store</label>
                    <select
                      value={syncCollection}
                      onChange={(e) => setSyncCollection(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer text-xs"
                    >
                      <option value="Ethnic Festive Wear">Ethnic Festive Wear (Active)</option>
                      <option value="Trending Best Sellers">Trending Best Sellers</option>
                      <option value="New Arrivals 2026">New Arrivals 2026</option>
                      <option value="All Products">General Catalog</option>
                    </select>
                  </div>

                  {/* Selling Price & Margin Config */}
                  <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-900">Your Store Selling Price (₹)</span>
                      <span className="text-[11px] text-gray-500">MSRP: ₹{syncModalProduct.mrp}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={syncResalePrice}
                        onChange={(e) => setSyncResalePrice(e.target.value)}
                        className="w-28 sm:w-32 px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex-1 text-right">
                        <span className="text-[11px] text-gray-500 block">Estimated Profit / Piece</span>
                        <strong className="text-emerald-600 font-extrabold text-sm">
                          +₹{Math.max(0, (Number(syncResalePrice) || syncModalProduct.suggestedResale) - syncModalProduct.supplierPrice)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* 2-Way Automated Sync Toggles */}
                  <div className="space-y-2 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                    <span className="font-bold text-gray-800 text-[11px] block uppercase tracking-wider">
                      2-Way Automation Rules
                    </span>
                    <label className="flex items-start sm:items-center gap-2 cursor-pointer text-gray-700">
                      <input
                        type="checkbox"
                        checked={syncAutoStock}
                        onChange={(e) => setSyncAutoStock(e.target.checked)}
                        className="accent-purple-600 w-4 h-4 rounded mt-0.5 sm:mt-0 shrink-0"
                      />
                      <span>
                        <strong>Auto-Sync Real-Time Stock:</strong> If supplier stock drops to 0, mark product as Out of Stock automatically on your store.
                      </span>
                    </label>
                    <label className="flex items-start sm:items-center gap-2 cursor-pointer text-gray-700">
                      <input
                        type="checkbox"
                        checked={syncAutoPrice}
                        onChange={(e) => setSyncAutoPrice(e.target.checked)}
                        className="accent-purple-600 w-4 h-4 rounded mt-0.5 sm:mt-0 shrink-0"
                      />
                      <span>
                        <strong>Auto-Sync Price Adjustments:</strong> Maintain your profit margin if supplier updates base supplier rates.
                      </span>
                    </label>
                    <label className="flex items-start sm:items-center gap-2 cursor-pointer text-gray-700">
                      <input
                        type="checkbox"
                        checked={syncPublishActive}
                        onChange={(e) => setSyncPublishActive(e.target.checked)}
                        className="accent-purple-600 w-4 h-4 rounded mt-0.5 sm:mt-0 shrink-0"
                      />
                      <span>
                        <strong>Publish as Live / Active:</strong> Product becomes immediately visible and purchasable on your website.
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Trigger Action Footer */}
            {!(isSyncing || syncStage === 3) && (
              <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-100 shrink-0 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSyncModalProduct(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecutePublish}
                  className="px-5 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">rocket_launch</span>
                  <span>Publish Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. STORE INTEGRATION SETTINGS MODAL */}
      {storeSettingsOpen && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setStoreSettingsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-4 sm:p-5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600 text-2xl">cable</span>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 font-['Plus_Jakarta_Sans']">
                    Connected Store Integration
                  </h3>
                  <p className="text-xs text-gray-500">Manage 1-Click Sync API for your eCommerce store</p>
                </div>
              </div>
              <button
                onClick={() => setStoreSettingsOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1 text-xs">
              {/* Store & Platform Profile */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">Connected Store Brand Name</label>
                <input
                  type="text"
                  value={connectedStore.storeName}
                  onChange={(e) => setConnectedStore((prev) => ({ ...prev, storeName: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Store Web Address / Domain</label>
                <input
                  type="text"
                  value={connectedStore.fullStoreUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    const clean = val.replace(/^https?:\/\//, '');
                    setConnectedStore((prev) => ({ ...prev, fullStoreUrl: val, storeUrl: clean }));
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs font-mono font-semibold text-purple-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">eCommerce Platform</label>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl font-bold text-purple-900">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{connectedStore.platform}</span>
                    <span className="text-[10px] text-purple-600 font-normal">(1-Click Sync API)</span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Order Capacity</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800">
                    {connectedStore.capacity}
                  </div>
                </div>
              </div>

              {/* Verified KYC Identifiers Section */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  Verified Dropshipper KYC Identifiers
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                  <div className="bg-white p-2 rounded-xl border border-gray-150">
                    <span className="text-gray-400 font-sans block text-[9px]">PAN</span>
                    <strong className="text-gray-900 truncate block">{connectedStore.pan}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-gray-150">
                    <span className="text-gray-400 font-sans block text-[9px]">Aadhaar</span>
                    <strong className="text-gray-900 truncate block">{connectedStore.aadhaar}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-gray-150">
                    <span className="text-gray-400 font-sans block text-[9px]">GSTIN</span>
                    <strong className="text-emerald-700 truncate block">{connectedStore.gstin}</strong>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Default Profit Margin Rule (%)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={connectedStore.defaultMargin}
                    onChange={(e) => setConnectedStore((prev) => ({ ...prev, defaultMargin: Number(e.target.value) || 0 }))}
                    className="w-24 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs"
                  />
                  <span className="text-gray-500 text-[11px]">Applied automatically on 1-Click Sync to {connectedStore.storeName}</span>
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span>Shopify Sync Status: <strong>Connected &amp; Active</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleSimulateStockAutoSync}
                  className="text-emerald-700 hover:underline font-bold cursor-pointer shrink-0"
                >
                  Ping Auto-Sync
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0 flex items-center justify-end gap-2">
              <button
                onClick={() => setStoreSettingsOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setStoreSettingsOpen(false);
                  try {
                    localStorage.setItem('meesho_connected_store', JSON.stringify(connectedStore));
                    const sess = localStorage.getItem('meesho_dropshipper_session');
                    if (sess) {
                      const p = JSON.parse(sess);
                      p.brandName = connectedStore.storeName;
                      p.storeUrl = connectedStore.fullStoreUrl;
                      localStorage.setItem('meesho_dropshipper_session', JSON.stringify(p));
                      setSession((prev) => ({ ...prev, brandName: connectedStore.storeName, storeUrl: connectedStore.fullStoreUrl }));
                    }
                  } catch (e) {}
                  triggerToast('✅ Store settings saved successfully!');
                }}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. LIVE STOREFRONT CUSTOMER VIEW MODAL (Internal Store Preview) */}
      {storePreviewProduct && (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setStorePreviewProduct(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Simulated Browser URL Bar */}
            <div className="bg-gray-900 text-white px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3 border-b border-gray-800 text-xs shrink-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
              </div>
              <div className="flex-1 max-w-xl mx-auto bg-gray-950 border border-gray-800 rounded-xl px-2 sm:px-3 py-1 flex items-center gap-1.5 text-gray-300 font-mono text-[10px] sm:text-[11px] truncate min-w-0">
                <span className="material-symbols-outlined text-emerald-400 text-xs shrink-0">lock</span>
                <span className="text-gray-400 hidden xs:inline">https://</span>
                <span className="text-white font-semibold truncate">{connectedStore.storeUrl}</span>
                <span className="text-gray-400 truncate">/products/{storePreviewProduct.sku.toLowerCase()}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full hidden md:inline">
                  Live Customer View
                </span>
                <button
                  onClick={() => setStorePreviewProduct(null)}
                  className="w-7 h-7 rounded-full hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition cursor-pointer"
                  title="Close Preview"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            </div>

            {/* Storefront Customer Experience Header */}
            <div className="bg-white border-b border-gray-100 px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <span className="text-base sm:text-lg font-black text-gray-900 tracking-tight font-['Plus_Jakarta_Sans'] truncate">
                  {connectedStore.storeName}
                </span>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <span className="text-xs text-emerald-700 font-medium hidden sm:inline">
                  Free Express Delivery Across India
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold text-gray-700 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setStorePreviewProduct(null);
                    setStoreCatalogOpen(true);
                  }}
                  className="text-purple-700 hover:text-purple-900 font-bold bg-purple-50 hover:bg-purple-100 px-2 sm:px-2.5 py-1 rounded-lg border border-purple-200 cursor-pointer transition flex items-center gap-1"
                  title={`View all products on ${connectedStore.storeName}`}
                >
                  <span className="material-symbols-outlined text-xs">storefront</span>
                  <span>Store Catalog ({Object.keys(syncedProducts).length})</span>
                </button>
                <span className="hidden md:inline hover:text-[#b90041] cursor-pointer">Track Order</span>
                <div className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full cursor-pointer text-xs">
                  <span className="material-symbols-outlined text-sm">shopping_bag</span>
                  <span>Cart (0)</span>
                </div>
              </div>
            </div>

            {/* Storefront Product Page Body */}
            <div className="overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8">
                {/* Product Photo Gallery */}
                <div className="md:col-span-6 space-y-2 sm:space-y-3">
                  <div className="aspect-[4/3] rounded-2xl bg-gray-100 overflow-hidden border border-gray-200 relative group">
                    <img
                      src={storePreviewProduct.images[previewImageIndex] || storePreviewProduct.images[0]}
                      alt={storePreviewProduct.name}
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                
                    {storePreviewProduct.images.length > 1 && (
                      <>
                        <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 rounded-full font-mono font-medium select-none pointer-events-none">
                          {previewImageIndex + 1} / {storePreviewProduct.images.length}
                        </div>

                        {/* Navigation Arrows */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImageIndex((prev) =>
                              prev === 0 ? storePreviewProduct.images.length - 1 : prev - 1
                            );
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg transition active:scale-90 cursor-pointer"
                          title="Previous image"
                        >
                          <span className="material-symbols-outlined text-base font-bold">chevron_left</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImageIndex((prev) =>
                              prev === storePreviewProduct.images.length - 1 ? 0 : prev + 1
                            );
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg transition active:scale-90 cursor-pointer"
                          title="Next image"
                        >
                          <span className="material-symbols-outlined text-base font-bold">chevron_right</span>
                        </button>
                      </>
                    )}
                  </div>

                  {storePreviewProduct.images.length > 1 && (
                    <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
                      {storePreviewProduct.images.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPreviewImageIndex(i)}
                          className={`w-14 sm:w-16 h-14 sm:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                            previewImageIndex === i
                              ? 'border-[#b90041] ring-2 ring-[#b90041]/30 scale-95 shadow-md'
                              : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-400'
                          }`}
                          title={`View image ${i + 1}`}
                        >
                          <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details & Customer Checkout */}
                <div className="md:col-span-6 space-y-3 sm:space-y-4">
                  <div>
                    <span className="text-[11px] sm:text-xs font-bold text-[#b90041] uppercase tracking-wider">
                      {storePreviewProduct.category}
                    </span>
                    <h1 className="text-lg sm:text-2xl font-black text-gray-900 font-['Plus_Jakarta_Sans'] mt-1 leading-snug">
                      {storePreviewProduct.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center text-amber-500 text-xs">
                        {'★'.repeat(5)}
                      </div>
                      <span className="text-[11px] sm:text-xs text-gray-500 font-medium">(148 Reviews)</span>
                    </div>
                  </div>

                  {/* Pricing Display */}
                  {(() => {
                    const retailPrice = syncedProducts[storePreviewProduct.id]?.storePrice || storePreviewProduct.suggestedResale;
                    const discount = Math.round(((storePreviewProduct.mrp - retailPrice) / storePreviewProduct.mrp) * 100);
                    return (
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-2xl border border-gray-100 space-y-1">
                        <div className="flex items-baseline gap-2.5 sm:gap-3">
                          <span className="text-2xl sm:text-3xl font-black text-gray-900">₹{retailPrice}</span>
                          <span className="text-xs sm:text-sm text-gray-400 line-through">₹{storePreviewProduct.mrp}</span>
                          <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Save {discount}% OFF
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-gray-500">Inclusive of all taxes • Free Cash on Delivery (COD)</p>
                      </div>
                    );
                  })()}

                  {/* Stock Availability Badge */}
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <span>In Stock — Dispatched within 24 Hours to customer</span>
                  </div>

                  {/* Size Selector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                      <span>Select Size:</span>
                      <span className="text-[#b90041] hover:underline cursor-pointer">Size Guide</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {storePreviewProduct.variants.map((v, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPreviewSelectedSize(v.size)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                            previewSelectedSize === v.size
                              ? 'border-[#b90041] bg-[#b90041] text-white shadow-xs'
                              : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {v.size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Customer Purchase Actions */}
                  <div className="space-y-2 pt-1 sm:pt-2">
                    <button
                      type="button"
                      onClick={() => triggerToast('🛒 Simulated Customer Click: "Buy Now" checkout triggered!')}
                      className="w-full py-3 sm:py-3.5 bg-[#b90041] hover:bg-[#a00037] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-lg transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base sm:text-lg">bolt</span>
                      <span>Buy It Now (COD Available)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerToast('🛍️ Simulated Customer Click: Added to Cart!')}
                      className="w-full py-2.5 sm:py-3 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm sm:text-base">add_shopping_cart</span>
                      <span>Add to Cart</span>
                    </button>
                  </div>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2.5 sm:pt-3 border-t border-gray-100 text-[9px] sm:text-[10px] text-gray-500 text-center">
                    <div className="p-1.5 sm:p-2 rounded-xl bg-gray-50">
                      <span className="material-symbols-outlined text-sm sm:text-base text-gray-700 block mx-auto">local_shipping</span>
                      <span className="font-bold text-gray-800 block mt-0.5">Free Express</span>
                      Across India
                    </div>
                    <div className="p-1.5 sm:p-2 rounded-xl bg-gray-50">
                      <span className="material-symbols-outlined text-sm sm:text-base text-gray-700 block mx-auto">change_circle</span>
                      <span className="font-bold text-gray-800 block mt-0.5">7-Day Easy</span>
                      Returns
                    </div>
                    <div className="p-1.5 sm:p-2 rounded-xl bg-gray-50">
                      <span className="material-symbols-outlined text-sm sm:text-base text-gray-700 block mx-auto">verified_user</span>
                      <span className="font-bold text-gray-800 block mt-0.5">100% Quality</span>
                      Verified Genuine
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Footer */}
            <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shrink-0">
              <span className="text-gray-500 font-medium text-center sm:text-left text-[11px] sm:text-xs">
                Live simulated buyer view on <strong>{connectedStore.storeName}</strong> (<span className="font-mono text-purple-700">{connectedStore.fullStoreUrl}</span> • {connectedStore.platform} Store).
              </span>
              <button
                onClick={() => setStorePreviewProduct(null)}
                className="w-full sm:w-auto px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition cursor-pointer text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. DROPSHIPPER PROFILE & VERIFICATION MODAL */}
      {profileModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setProfileModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-150 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white p-4 sm:p-5 relative">
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="w-11 sm:w-12 h-11 sm:h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-2xl font-bold border border-white/20 shadow-xs shrink-0">
                  <span className="material-symbols-outlined text-2xl">verified_user</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm sm:text-base font-extrabold truncate">{connectedStore.storeName || session?.name || 'Aura Trends Luxe'}</h3>
                    <span className="bg-emerald-400/30 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded border border-white/30 shrink-0">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 font-mono mt-0.5 truncate">
                    ID: {session?.dropshipperId || 'DSP-KYC-9421'} • {session?.tier || 'Tier 1'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-3.5 sm:space-y-4">
              {/* Account Quick Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 p-2.5 sm:p-3 rounded-2xl border border-gray-150">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Store Brand</span>
                  <span className="font-extrabold text-gray-900 flex items-center gap-1 mt-0.5 text-xs truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    {connectedStore.storeName}
                  </span>
                </div>

                <div className="bg-gray-50 p-2.5 sm:p-3 rounded-2xl border border-gray-150">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Platform &amp; Capacity</span>
                  <span className="font-extrabold text-purple-700 mt-0.5 block text-xs truncate">
                    {connectedStore.platform} ({connectedStore.capacity})
                  </span>
                </div>

                <div className="bg-gray-50 p-2.5 sm:p-3 rounded-2xl border border-gray-150">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">PAN Identifier</span>
                  <span className="font-bold text-gray-900 font-mono mt-0.5 block text-xs truncate">
                    {connectedStore.pan}
                  </span>
                </div>

                <div className="bg-gray-50 p-2.5 sm:p-3 rounded-2xl border border-gray-150">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Aadhaar (UIDAI)</span>
                  <span className="font-bold text-gray-900 font-mono mt-0.5 block text-xs truncate">
                    {connectedStore.aadhaar}
                  </span>
                </div>

                <div className="bg-gray-50 p-2.5 sm:p-3 rounded-2xl border border-gray-150 col-span-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">GSTIN Number</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5 text-xs font-mono">
                    <span className="material-symbols-outlined text-xs shrink-0">check_circle</span>
                    {connectedStore.gstin} (Active on GSTN)
                  </span>
                </div>
              </div>

              {/* Privilege Checklist */}
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3 sm:p-3.5 space-y-2">
                <span className="text-xs font-bold text-emerald-900 block flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-emerald-600">military_tech</span>
                  Active Tier 1 Privileges:
                </span>
                <ul className="text-xs text-gray-700 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-sm mt-0.5 shrink-0">check</span>
                    <span>Direct wholesale pricing on 85,000+ factory SKUs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-sm mt-0.5 shrink-0">check</span>
                    <span>1-Click 2-Way automated store inventory sync to {connectedStore.storeName}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-sm mt-0.5 shrink-0">check</span>
                    <span>Blind dropship packaging (customers never see Meesho)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-sm mt-0.5 shrink-0">check</span>
                    <span>Zero MOQ sample orders &amp; 7-day easy returns</span>
                  </li>
                </ul>
              </div>

              {/* Connected Store Quick Tag */}
              <div className="flex items-center justify-between bg-purple-50 border border-purple-200 p-2.5 sm:p-3 rounded-2xl text-xs gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-purple-700 text-lg shrink-0">storefront</span>
                  <div className="min-w-0">
                    <span className="font-bold text-purple-900 block truncate">Store: {connectedStore.storeName}</span>
                    <span className="text-[11px] text-purple-600 font-mono truncate block">{connectedStore.fullStoreUrl} ({connectedStore.platform})</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProfileModalOpen(false);
                    setStoreSettingsOpen(true);
                  }}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[11px] transition cursor-pointer shrink-0"
                >
                  Configure
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => {
                    setProfileModalOpen(false);
                    navigate('/dropshipper-login');
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">switch_account</span>
                  <span>Switch Account</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('meesho_dropshipper_session');
                      setProfileModalOpen(false);
                      navigate('/dropshipper-login');
                    }}
                    className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  >
                    Logout
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfileModalOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. AURA TRENDS LUXE - STORE CATALOG & LIVE INVENTORY MODAL */}
      {storeCatalogOpen && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setStoreCatalogOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Simulated Browser Address Bar */}
            <div className="bg-gray-900 text-white px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <div className="flex-1 max-w-lg mx-auto bg-gray-800/90 text-gray-200 rounded-lg px-3 py-1 flex items-center gap-2 text-[11px] sm:text-xs font-mono border border-gray-700">
                <span className="material-symbols-outlined text-xs text-emerald-400">lock</span>
                <span className="truncate">{connectedStore.fullStoreUrl}/collections/all</span>
                <span className="ml-auto text-[10px] bg-emerald-950 text-emerald-300 font-sans font-bold px-1.5 py-0.2 rounded border border-emerald-800 shrink-0">
                  Shopify Live
                </span>
              </div>
              <button
                onClick={() => setStoreCatalogOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                title="Close Catalog"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Store Header & Overview */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-gray-900 text-white p-4 sm:p-5 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-black font-['Plus_Jakarta_Sans'] tracking-tight">
                      {connectedStore.storeName}
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Shopify Active
                    </span>
                  </div>
                  <p className="text-xs text-purple-200/80 mt-1">
                    Storefront: <strong className="text-white font-mono">{connectedStore.fullStoreUrl}</strong> • Capacity: {connectedStore.capacity}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setStoreCatalogOpen(false);
                      setStockFilter('all');
                    }}
                    className="px-3 py-1.5 bg-white text-gray-900 hover:bg-gray-100 text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm text-[#b90041]">add</span>
                    <span>Publish More Products</span>
                  </button>
                  <button
                    onClick={() => {
                      setStoreCatalogOpen(false);
                      setStoreSettingsOpen(true);
                    }}
                    className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer"
                    title="Store Settings & KYC"
                  >
                    <span className="material-symbols-outlined text-lg">settings</span>
                  </button>
                </div>
              </div>

              {/* Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-purple-800/60 text-xs">
                <div className="bg-white/10 rounded-xl p-2.5">
                  <span className="text-purple-300 text-[10px] uppercase font-bold block">Live Products</span>
                  <span className="text-base sm:text-lg font-black text-white">{storeSyncedProductsList.length} SKUs</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5">
                  <span className="text-purple-300 text-[10px] uppercase font-bold block">2-Way Sync</span>
                  <span className="text-base sm:text-lg font-black text-emerald-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">bolt</span> Active
                  </span>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5">
                  <span className="text-purple-300 text-[10px] uppercase font-bold block">Verified PAN</span>
                  <span className="text-base sm:text-lg font-black text-white font-mono">{connectedStore.pan}</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5">
                  <span className="text-purple-300 text-[10px] uppercase font-bold block">Avg Profit / Sale</span>
                  <span className="text-base sm:text-lg font-black text-amber-300">
                    ₹{storeSyncedProductsList.length > 0
                      ? Math.round(
                          storeSyncedProductsList.reduce(
                            (acc, p) => acc + ((syncedProducts[p.id]?.storePrice || p.suggestedResale) - p.supplierPrice),
                            0
                          ) / storeSyncedProductsList.length
                        )
                      : 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Synced Products List */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-3 flex-1 bg-gray-50">
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                  Products Currently Live on {connectedStore.storeName} ({storeSyncedProductsList.length})
                </h3>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Automated Shopify Sync Active
                </span>
              </div>

              {storeSyncedProductsList.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-3 my-4">
                  <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-2xl">storefront</span>
                  </div>
                  <h4 className="font-extrabold text-gray-900 text-base">
                    Aapke store par abhi koi product sync nahi hai
                  </h4>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Supplier catalog me kisi bhi product ke neeche "1-Click Sync to {connectedStore.storeName}" click karein aur product direct aapke store par live ho jayega.
                  </p>
                  <button
                    onClick={() => {
                      setStoreCatalogOpen(false);
                      setStockFilter('all');
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs hover:from-purple-700 hover:to-indigo-700 transition cursor-pointer"
                  >
                    Browse Supplier Products
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {storeSyncedProductsList.map((p) => {
                    const syncData = syncedProducts[p.id] || {};
                    const retailPrice = syncData.storePrice || p.suggestedResale;
                    const netMargin = retailPrice - p.supplierPrice;
                    const marginPercent = Math.round((netMargin / retailPrice) * 100);

                    return (
                      <div
                        key={p.id}
                        className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-gray-200 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                                {p.category}
                              </span>
                              <span className="text-[10px] font-mono text-gray-500">
                                SKU: {p.sku}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Live on Store
                              </span>
                            </div>
                            <h4 className="font-extrabold text-sm text-gray-900 truncate mt-1">
                              {p.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs mt-1.5">
                              <span className="text-gray-500">
                                Supplier: <strong className="text-gray-800">₹{p.supplierPrice}</strong>
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-700">
                                Store Selling Price: <strong className="text-purple-700 font-extrabold">₹{retailPrice}</strong>
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                Margin: +₹{netMargin} ({marginPercent}%)
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-500 font-mono text-[11px]">
                                Stock: {p.stock} units
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions for this synced product */}
                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                          <button
                            onClick={() => {
                              setStoreCatalogOpen(false);
                              handleOpenStorePreview(p);
                            }}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-xs transition cursor-pointer active:scale-95"
                            title="Open Live Simulated Buyer View"
                          >
                            <span className="material-symbols-outlined text-sm">storefront</span>
                            <span>Live Buyer View</span>
                          </button>
                          <button
                            onClick={() => {
                              setStoreCatalogOpen(false);
                              handleOpenSyncModal(p);
                            }}
                            className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition cursor-pointer"
                            title="Adjust Selling Price / Profit Margin"
                          >
                            <span className="material-symbols-outlined text-sm">tune</span>
                            <span className="hidden sm:inline">Price</span>
                          </button>
                          <button
                            onClick={() => handleRemoveFromStore(p.id)}
                            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition cursor-pointer"
                            title={`Remove from ${connectedStore.storeName}`}
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 text-xs">
              <div className="flex items-center gap-1.5 text-gray-500 text-[11px] sm:text-xs">
                <span className="material-symbols-outlined text-emerald-600 text-base">verified</span>
                <span>
                  Connected to <strong>{connectedStore.storeName}</strong> ({connectedStore.fullStoreUrl}) via Shopify Webhooks
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setStoreCatalogOpen(false);
                    setStockFilter('store_synced');
                  }}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Filter Main Catalog to Store
                </button>
                <button
                  onClick={() => setStoreCatalogOpen(false)}
                  className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global App Bottom Navigation */}
      <AppBottomNav active="categories" />
    </div>
  );
}
