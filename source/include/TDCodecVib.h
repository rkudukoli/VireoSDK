/**
 
Copyright (c) 2014 National Instruments Corp.
 
This software is subject to the terms described in the LICENSE.TXT file
 
SDG
*/

/*! \file
    \brief A Vireo codec for the VIB (VI Binary) binary format.
 */

#ifndef TypeAndDataCodecBin8_h
#define TypeAndDataCodecBin8_h

namespace Vireo
{

class SubBuffer : public SimpleSubVector<UInt8>
{
public:
    SubBuffer()
            { }
    SubBuffer(const Utf8Char * begin, const Utf8Char *end)
            { AliasAssign(begin, end); }
    SubBuffer(SubBuffer* original)
            { AliasAssign(original->Begin(), original->End()); }
    
    IntMax ReadVBWSInt();
    IntMax ReadVBWUInt();
    NIError Error();
};


//------------------------------------------------------------
class TDVibDecoder
{
private:
    TypeManager*    _typeManager;
    SubBuffer       _buffer;
    
public:
    TDVibDecoder(TypeManager *typeManager, SubBuffer* buffer);

    TypeRef DecodeType();
    void DecodeData(TypeRef type, void* pData, Int32 rank);
    void DecodeArrayData(TypeRef type, void* pData, Int32 rank);
    
    void DecodeVirtualInstrument(TypeRef viType, void* pData);
    void DecodeClump(VIClump* clump, Boolean delayedLoad);

    void DelayDecodeClump(VIClump* viClump);
    void DecodeInstructionArguments(VIClump* clump);

private :
    void MarkError(const char* message);
    TypeRef BadType()   {return _typeManager->BadType();}   // TODO could create error that encodes scan point
    NIError ParseAggrigateElementList(TypeRef ElementTypes[], Int32* pElementCount);
    TypeRef ParseArray();
    TypeRef ParseArrayElement();
    TypeRef ParseBitBlock();
    TypeRef ParseBitCluster();
    TypeRef ParseCluster();
    TypeRef ParseDefaultValue();
    TypeRef ParseEquivalence();
    TypeRef ParseParamBlock();
    TypeRef ParsePointerType(Boolean shortNotation);
    EncodingEnum ParseEncoding(SubString* string);

};

//------------------------------------------------------------
class TDVibEncoder
{
private:
    BinaryBufferRef     _buffer;

public:
    TDVibEncoder(BinaryBufferRef bufferRef);

    void EncodeData();
    
    void EncodeType(TypeRef type);
    void EncodeClusterType(TypeRef clusterType);
    void EncodeArrayType(TypeRef arrayType);
    
    // Data formatters
    void EncodeData(TypeRef type, void* pData);
    void EncodeArrayData(TypeRef arrayType, TypedArrayCore* pData, Int32 rank);
    void EncodeArrayDataRecurse(TypeRef elementType, Int32 rank, AQBlock1* pBegin,
                                   IntIndex *pDimLengths, IntIndex *pSlabLengths);
    
    void EncodeClusterData(TypeRef clusterType, void* pData);
    void EncodePointerData(TypeRef pointerType, void* pData);
    void EncodeSInt(Int32 aqSize, void* pData);
    void EncodeUInt(Int32 aqSize, void* pData);
    void EncodeVBWSInt(IntMax value);
    void EncodeVBWUInt(UIntMax value);
    void EncodeIEEE754(EncodingEnum encoding, Int32 aqSize, void* pData);
    
    // The maximum for a size field arbitrarily large since the format
    // uses a variable-width encoding for all sizes. The reader for different size targets
    // may be hard coded to only support a limits size typically UInt8, UIn16, UInt32, or UInt64.
    // the reader should be able to safely report an error when reading sizes larger than supported
    // on the target.
};
    
}
#endif //TypeAndDataCodecBin8_H
