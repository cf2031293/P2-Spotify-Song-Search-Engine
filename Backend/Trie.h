#ifndef TRIE_H
#define TRIE_H

#include <string>
#include <vector>
#include <unordered_map>
#include "Song.h"
using namespace std;

// One node in the Trie
struct TrieNode {
    unordered_map<char, TrieNode*> children;
    vector<Song*> songs;
    bool isEndOfWord;

    TrieNode() {
        isEndOfWord = false;
    }
};

class Trie {
private:
    TrieNode* root;

    string cleanText(string text);
    void collectSongs(TrieNode* node, vector<Song*>& results);

public:
    Trie();

    // Adds an artist name into the Trie
    void insert(const string& artist, Song* song);

    // Finds songs by artist prefix
    vector<Song*> searchByPrefix(const string& prefix);
};

#endif