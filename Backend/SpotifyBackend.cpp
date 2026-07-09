#include "SpotifyBackend.h"
#include <iostream>
#include <fstream>
#include <sstream>
using namespace std;

SpotifyBackend::SpotifyBackend()
    : popularityTree(3), danceabilityTree(3), energyTree(3), tempoTree(3) {
}

// Splits a CSV row
vector<string> SpotifyBackend::splitCSVLine(const string& line) {
    vector<string> row;
    string current;
    bool insideQuotes = false;

    for (char c : line) {
        if (c == '"') {
            insideQuotes = !insideQuotes;
        } else if (c == ',' && !insideQuotes) {
            row.push_back(current);
            current.clear();
        } else {
            current += c;
        }
    }

    row.push_back(current);
    return row;
}

// Loads the dataset into memory and search structures
bool SpotifyBackend::loadCSV(const string& filename) {
    ifstream file(filename);

    if (!file.is_open()) {
        cout << "Could not open dataset file: " << filename << endl;
        return false;
    }

    string line;
    getline(file, line);

    while (getline(file, line)) {
        vector<string> row = splitCSVLine(line);

        if (row.size() < 20) {
            continue;
        }

        try {
            Song song;

            song.trackId = row[0];
            song.artists = row[2];
            song.trackName = row[4];

            song.popularity = stoi(row[5]);
            song.danceability = stod(row[8]);
            song.energy = stod(row[9]);
            song.acousticness = stod(row[13]);
            song.instrumentalness = stod(row[14]);
            song.valence = stod(row[17]);
            song.tempo = stod(row[18]);

            songs.push_back(song);

            Song* songPointer = &songs.back();

            artistTrie.insert(song.artists, songPointer);
            popularityTree.insert(song.popularity, songPointer);
            danceabilityTree.insert(song.danceability, songPointer);
            energyTree.insert(song.energy, songPointer);
            tempoTree.insert(song.tempo, songPointer);
        } catch (...) {
            continue;
        }
    }

    file.close();
    return true;
}

// Searches artists using the Trie
vector<Song*> SpotifyBackend::searchArtist(const string& artistPrefix) {
    return artistTrie.searchByPrefix(artistPrefix);
}

// Searches popularity using the B Tree
vector<Song*> SpotifyBackend::searchPopularityRange(double minValue, double maxValue) {
    return popularityTree.searchRange(minValue, maxValue);
}

// Searches danceability using the B Tree
vector<Song*> SpotifyBackend::searchDanceabilityRange(double minValue, double maxValue) {
    return danceabilityTree.searchRange(minValue, maxValue);
}

// Searches energy using the B Tree
vector<Song*> SpotifyBackend::searchEnergyRange(double minValue, double maxValue) {
    return energyTree.searchRange(minValue, maxValue);
}

// Searches tempo using the B Tree
vector<Song*> SpotifyBackend::searchTempoRange(double minValue, double maxValue) {
    return tempoTree.searchRange(minValue, maxValue);
}

// Prints a small number of results
void SpotifyBackend::printSongs(const vector<Song*>& results, int limit) {
    int count = results.size();

    if (count > limit) {
        count = limit;
    }

    for (int i = 0; i < count; i++) {
        cout << "Artist: " << results[i]->artists << endl;
        cout << "Song: " << results[i]->trackName << endl;
        cout << "Popularity: " << results[i]->popularity << endl;
        cout << "Danceability: " << results[i]->danceability << endl;
        cout << "Energy: " << results[i]->energy << endl;
        cout << "Tempo: " << results[i]->tempo << " BPM" << endl;
        cout << endl;
    }
}

int SpotifyBackend::getSongCount() const {
    return songs.size();
}

const vector<Song>& SpotifyBackend::getSongs() const {
    return songs;
}