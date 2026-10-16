/*
 * Homes shown when the site has no LISTINGS_KEY (listings.js reads these
 * instead of the CRM).
 *
 *   Always:        the real T2 in Castanheira do Ribatejo (UF-001).
 *   With ?demo=1:  also the sample homes below, so the search, the filters and
 *                  "mais vistos" can be shown before the CRM is connected.
 *                  Remembered for the visit; ?demo=0 turns it off. They are
 *                  fictional and never show without that flag.
 */
(function () {
  'use strict';
  var flag = new URLSearchParams(location.search).get('demo');
  try {
    if (flag === '1') sessionStorage.setItem('uf-demo', '1');
    if (flag === '0') sessionStorage.removeItem('uf-demo');
    flag = sessionStorage.getItem('uf-demo');
  } catch (e) { flag = flag === '1' ? '1' : null; }

  function u(id) { return { url: 'https://images.unsplash.com/photo-' + id + '?w=1400&q=70&auto=format&fit=crop' }; }
  var DAY = 864e5;
  function ago(days) { return new Date(Date.now() - days * DAY).toISOString(); }

  var real = [{
    reference: 'UF-001', title: 'T2 totalmente remodelado', listingType: 'sale', status: 'available',
    propertyType: 'apartment', bedrooms: 2, areaSqm: 61.2, price: 219000,
    address: { neighbourhood: 'Centro', city: 'Castanheira do Ribatejo' },
    photos: [{ url: '/img/t2_cozinha.jpg', caption: 'Cozinha' }, { url: '/img/t2_sala.jpg', caption: 'Sala' }, { url: '/img/t2_varanda.jpg', caption: 'Varanda' }, { url: '/img/t2_wc.jpg', caption: 'Casa de banho' }],
    description: 'T2 no centro de Castanheira do Ribatejo, totalmente remodelado pela Urban Focus e pronto a habitar.\n\nÁrea de 61,20 m² e uma varanda de 19,80 m².',
    features: ['Totalmente remodelado', 'Varanda de 19,80 m²', 'Pronto a habitar'],
    createdAt: ago(20),
  }];

  var samples = [
    { reference: 'DEMO-02', title: 'T3 com terraço e vista rio', propertyType: 'apartment', bedrooms: 3, bathrooms: 2, areaSqm: 112, price: 345000,
      address: { neighbourhood: 'Alverca do Ribatejo', city: 'Vila Franca de Xira' }, energyRating: 'B', yearBuilt: 1998,
      photos: [u('1600585154340-be6161a56a0c'), u('1556909114-f6e7ad7d3136'), u('1505691938895-1758d7feb511'), u('1522708323590-d24dbb6b0267')],
      description: 'Apartamento remodelado com terraço de 30 m² virado ao Tejo. Cozinha equipada, caixilharia nova e aquecimento central.',
      features: ['Terraço', 'Vista rio', 'Garagem', 'Elevador'], createdAt: ago(3), views: 655 },
    { reference: 'DEMO-03', title: 'Moradia V4 com jardim', propertyType: 'house', bedrooms: 4, bathrooms: 3, areaSqm: 186, plotSqm: 420, price: 489000,
      address: { neighbourhood: 'Quinta do Conde', city: 'Sesimbra' }, energyRating: 'A', yearBuilt: 2006,
      photos: [u('1600596542815-ffad4c1539a9'), u('1568605114967-8130f3a36994'), u('1600607687939-ce8a6c25118c'), u('1600566753190-17f0baa2a6c3'), u('1513694203232-719a280e022f')],
      description: 'Moradia isolada recuperada, com jardim, churrasqueira e garagem para dois carros. A cinco minutos da A2.',
      features: ['Jardim', 'Garagem para 2', 'Painéis solares', 'Churrasqueira'], createdAt: ago(9), views: 538 },
    { reference: 'DEMO-04', title: 'T1 renovado junto à estação', propertyType: 'apartment', bedrooms: 1, bathrooms: 1, areaSqm: 54, price: 179000,
      address: { neighbourhood: 'Centro', city: 'Barreiro' }, energyRating: 'C', yearBuilt: 1975,
      photos: [u('1502672260266-1c1ef2d93688'), u('1522708323590-d24dbb6b0267'), u('1484154218962-a197022b5858')],
      description: 'T1 com obras novas a dois minutos do terminal fluvial. Ideal para primeira casa ou investimento.',
      features: ['Junto ao barco', 'Obras novas', 'Arrecadação'], createdAt: ago(1), views: 297 },
    { reference: 'DEMO-05', title: 'T2 com varanda, perto do metro', propertyType: 'apartment', bedrooms: 2, bathrooms: 1, areaSqm: 78, price: 299000,
      address: { neighbourhood: 'Odivelas', city: 'Odivelas' }, energyRating: 'C', yearBuilt: 1984, status: 'reserved',
      photos: [u('1493809842364-78817add7ffb'), u('1586023492125-27b2c045efd7'), u('1560448204-e02f11c3d0e2')],
      description: 'Apartamento recuperado a cinco minutos a pé do metro. Duas varandas, cozinha nova e casa de banho com duche.',
      features: ['Metro a 5 min', 'Duas varandas', 'Cozinha nova'], createdAt: ago(14), views: 389 },
    { reference: 'DEMO-06', title: 'Moradia V3 térrea', propertyType: 'house', bedrooms: 3, bathrooms: 2, areaSqm: 140, plotSqm: 300, price: 365000,
      address: { neighbourhood: 'Alcochete', city: 'Alcochete' }, energyRating: 'B', yearBuilt: 1992, status: 'sold',
      photos: [u('1570129477492-45c003edd2be'), u('1580587771525-78b9dba3b914'), u('1564013799919-ab600027ffc6')],
      description: 'Moradia térrea com logradouro, totalmente remodelada.',
      features: ['Térrea', 'Logradouro'], createdAt: ago(40), views: 702 },
    { reference: 'DEMO-07', title: 'T2 duplex remodelado', propertyType: 'apartment', bedrooms: 2, bathrooms: 2, areaSqm: 96, price: 255000,
      address: { neighbourhood: 'Seixal', city: 'Seixal' }, energyRating: 'B-', yearBuilt: 2001,
      photos: [u('1512917774080-9991f1c4c750'), u('1600585154340-be6161a56a0c'), u('1505691938895-1758d7feb511')],
      description: 'Duplex no último piso com mezanino e lugar de garagem.',
      features: ['Duplex', 'Garagem', 'Último piso'], createdAt: ago(6), views: 211 },
  ].map(function (p) { return Object.assign({ listingType: 'sale', status: 'available' }, p); });

  window.DEMO_LISTINGS = flag === '1' ? real.concat(samples) : real;
  window.DEMO_MODE = flag === '1';
})();
