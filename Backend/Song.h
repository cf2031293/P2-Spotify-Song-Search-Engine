#ifndef SONG_H
#define SONG_H

#include <string>
using namespace std;

// Stores one song from the Spotify dataset
struct Song {
    string trackId;
    string artists;
    string trackName;

    int popularity;
    double danceability;
    double energy;
    double tempo;
    double valence;
    double acousticness;
    double instrumentalness;
};

#endif