// Replace your old form submission saving logic with this:
const newReport = {
  category: document.getElementById('category').value,
  location: document.getElementById('location').value,
  description: document.getElementById('description').value,
};

// Send the report details up to your serverless backend bridge
fetch('/.netlify/functions/report', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(newReport),
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    alert('Report successfully saved to Couchbase Capella!');
    document.getElementById('reportForm').reset(); // Clears the form fields
  } else {
    alert('Error saving report: ' + data.error);
  }
})
.catch(error => {
  console.error('Error:', error);
  alert('Failed to connect to backend server.');
});