#include "Trie.h"
#include <cctype>

Trie::Trie() {
    root = new TrieNode();
}

// Makes searches case-insensitive
string Trie::cleanText(string text) {
    string cleaned;

    for (char c : text) {
        cleaned += tolower(c);
    }

    return cleaned;
}

// Inserts an artist name character by character
void Trie::insert(const string& artist, Song* song) {
    string key = cleanText(artist);
    TrieNode* current = root;

    for (char c : key) {
        if (current->children.find(c) == current->children.end()) {
            current->children[c] = new TrieNode();
        }

        current = current->children[c];
    }

    current->isEndOfWord = true;
    current->songs.push_back(song);
}

// Collects all songs below a prefix node
void Trie::collectSongs(TrieNode* node, vector<Song*>& results) {
    if (node == nullptr) {
        return;
    }

    for (Song* song : node->songs) {
        results.push_back(song);
    }

    for (auto& child : node->children) {
        collectSongs(child.second, results);
    }
}

// Searches for all artists matching a prefix
vector<Song*> Trie::searchByPrefix(const string& prefix) {
    string key = cleanText(prefix);
    TrieNode* current = root;
    vector<Song*> results;

    for (char c : key) {
        if (current->children.find(c) == current->children.end()) {
            return results;
        }

        current = current->children[c];
    }

    collectSongs(current, results);
    return results;
}