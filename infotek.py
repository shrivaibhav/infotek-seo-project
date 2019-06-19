  def check_keyword_density(self,tf,tree,xpath,scraper_element,keyword_count):
        meta_key_ctr = []
        meta_key_bi = []
        meta_key_tri = []
        biwords = []
        triwords = []
        intersect = []
        meta_key = []
        results = []
        data = scraper_element.extract_keywords_url(tree, xpath)
        if hasattr(self,'meta_key'):
            meta_key = self.make_data_readable_(self.meta_key, False,True,True)
            for mk in range(len(meta_key)):
                tmp_str = meta_key[mk]
                meta_key_ctr.append(tmp_str)
                if (mk + 1) < len(meta_key):
                    meta_key_bi.append(tmp_str + " " + meta_key[mk + 1])
                    if(mk + 2) < len(meta_key):
                        meta_key_tri.append(
                            tmp_str + " " + meta_key[mk + 1] + " " + meta_key[mk + 2])

            meta_key_ctr = self.extract_top_words_from(50, meta_key_ctr)
            meta_key_ctr = meta_key_ctr[0]
            meta_key_bi = self.extract_top_words_from(50, meta_key_bi)
            meta_key_bi = meta_key_bi[0]
            meta_key_tri = self.extract_top_words_from(50, meta_key_tri)
            meta_key_tri = meta_key_tri[0]
            meta_key = meta_key_ctr + meta_key_bi + meta_key_tri
            meta_key = re.sub("[^a-zA-Z ,-]+", ' ', meta_key)
        words = self.make_data_readable_(data, True, False,True)
        tmp_words = self.make_data_readable_(data, True, True,True)
        words_len = len(words)
        word_len_for_tri = len(tmp_words)
        ctrlist = self.extract_top_words_from(keyword_count, words)
        ctrtopwords = ctrlist[1]
        ctrtopwords = base64.encodestring(json.dumps(ctrtopwords).encode())
        ctrtopwords = ctrtopwords.decode()
        ctrlist = ctrlist[0]

        for a in range(words_len - 1):
            biwords.append(words[a] + " " + words[a + 1])

        for a in range(word_len_for_tri - 2):
            triwords.append(tmp_words[a] + " " +
                            tmp_words[a + 1] + " " + tmp_words[a + 2])

        meta_key_len = len(meta_key)
        results.append({"count1": str(words_len)})
        results.append({"count2": str(word_len_for_tri)})
        results.append({"siwords": ctrtopwords})
        bilist = self.extract_top_words_from(keyword_count, biwords)
        bitopwords = bilist[1]
        bitopwords = base64.encodestring(json.dumps(bitopwords).encode())
        bitopwords = bitopwords.decode()
        results.append({"biwords": bitopwords})
        bilist = bilist[0]

        trilist = tf.extract_top_words_from(keyword_count, triwords)
        tritopwords = trilist[1]
        tritopwords = base64.encodestring(json.dumps(tritopwords).encode())
        tritopwords = tritopwords.decode()
        results.append({"triwords": tritopwords})
        trilist = trilist[0]
        
        strt = ctrlist + "" + bilist + "" + trilist
        strt = tf.return_keywords_into_set(strt)
        if meta_key:
            meta_key = tf.return_keywords_into_set(meta_key)
            intersect = meta_key.intersection(strt)
            intersect = list(intersect)
            intersect = base64.encodestring(json.dumps(intersect).encode())
            intersect = intersect.decode()
        if intersect:
            results.append({"intersec": intersect})    
        else:
            results.append({"intersec": "no"})
        return results