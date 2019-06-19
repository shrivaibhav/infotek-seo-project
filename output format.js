// For Competitors and Keywords ---------------
//if any error occurs
result = {
  error: "Some error"
};
//else
result = {
  category: "category",
  urls: ["url1", "url2", "url3"],
  keywords: ["keyword1", "keyword2", "keyword3"]
};

// For broken links ---------------------------
// if error
result = { error: "Some error" };
//else
result = {
  broken_links: ["url1", "url2", "url3"],
  num_active_links: 6, //Number
  num_broken_links: 1,
  num_redirect_links: 0,
  num_total_links: 7
};
