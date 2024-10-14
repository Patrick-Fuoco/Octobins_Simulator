import React, { useContext } from 'react';
import { Document, Page, Text, Image, StyleSheet, pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { AppContext } from './AppContext';

// Define your total pieces object
const totalpieces = {
  red: 1,
  blue: 0,
  white: 0,
  green: 0,
  yellow: 0,
  purple: 0,
  black: 0,
  pink: 0,
  grey: 0,
};

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#E4E4E4',
    padding: 10,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  text: {
    fontSize: 25,
  },
  image: {
    width: 150,
    height: 150,
  },
});

// Function to calculate total pieces
const calculateTotalPieces = () => {
  let total = 0;
  Object.values(totalpieces).forEach(count => {
    total += count;
  });
  return total;
};

// Create Document Component
const MyDocument = () => {
  const [state, setState] = useContext(AppContext);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.text}>Octogonal Bins</Text>
        <Image style={styles.image} src="https://images.unsplash.com/photo-1718809070453-47e72a835635?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
        <Text style={styles.text}>Total Pieces:</Text>
        {/* Display total pieces for each color if count > 0 */}
        {Object.entries(totalpieces).map(([color, count]) => (
          count > 0 && <Text key={color} style={styles.text}>{`${color}: ${count}`}</Text>
        ))}
        {/* Alternatively, you can display a single line for total pieces amount */}
        {/* <Text style={styles.text}>{`Total Pieces: ${calculateTotalPieces()}`}</Text> */}
      </Page>
    </Document>
  );
};

export const generatePdf = async () => {
  const doc = <MyDocument />;
  const asPdf = pdf([]); // Create instance of PDF and pass an empty array
  asPdf.updateContainer(doc); // Add the document component to the PDF instance

  const blob = await asPdf.toBlob(); // Generate the PDF as a blob
  saveAs(blob, 'Octogonal.pdf'); // Use file-saver to save the PDF
};
