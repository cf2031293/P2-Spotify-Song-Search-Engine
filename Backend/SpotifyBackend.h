#ifndef SPOTIFYBACKEND_H
#define SPOTIFYBACKEND_H

#include <vector>
#include <string>
#include "Song.h"
#include "Trie.h"
#include "BTree.h"
using namespace std;

class SpotifyBackend {
private:
    // Main storage for all songs
    vector<Song> songs;

    Trie artistTrie;
    BTree popularityTree;
    BTree danceabilityTree;
    BTree energyTree;
    BTree tempoTree;

    vector<string> splitCSVLine(const string& line);

public:
    SpotifyBackend();

    bool loadCSV(const string& filename);

    vector<Song*> searchArtist(const string& artistPrefix);
    vector<Song*> searchPopularityRange(double minValue, double maxValue);
    vector<Song*> searchDanceabilityRange(double minValue, double maxValue);
    vector<Song*> searchEnergyRange(double minValue, double maxValue);
    vector<Song*> searchTempoRange(double minValue, double maxValue);

    void printSongs(const vector<Song*>& results, int limit);
    int getSongCount() const;
    const vector<Song>& getSongs() const;
};

#endif