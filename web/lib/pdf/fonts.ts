import { Font } from '@react-pdf/renderer';

// Registrar Barlow desde Google Fonts (requiere acceso a internet en tiempo de generación).
// Si falla por CORS o conectividad, @react-pdf/renderer usa Helvetica como fallback automático.
Font.register({
  family: 'Barlow',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/barlow/v12/7cHpv4kjgoGqM7E_DMs5.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/barlow/v12/7cHrv4kjgoGqM7E3w-os0g.ttf',
      fontWeight: 700,
    },
  ],
});

// Barlow Condensed para títulos
Font.register({
  family: 'BarlowCondensed',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/barlowcondensed/v12/HTxxL3I-JCGChYJ8VI-L6OO_au7B497y_3HcuKECcrs.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/barlowcondensed/v12/HTxxL3I-JCGChYJ8VI-L6OO_au7B6ezA_3HcuKECcrs.ttf',
      fontWeight: 700,
    },
  ],
});
