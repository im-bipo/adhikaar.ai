import React from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircleQuestion, Users, FileText } from "lucide-react"
import Image from 'next/image'

const HeroLander = () => {
    return (
        <section className="relative flex h-[90vh] items-center w-full justify-center bg-[#1A2B5B] text-white px-4 py-12 md:py-24 lg:py-32">
            <div className="container flex flex-col items-center justify-center text-center space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">Understand Your Rights</h1>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-200">Simply & Clearly</h2>
                <p className="max-w-3xl text-base md:text-lg text-gray-300 leading-relaxed">
                    A platform to help Nepali citizens understand law, constitution, and their rights in simple, conversational
                    language
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                        asChild
                        className="bg-[#E53E5F] hover:bg-[#D62C4D] text-white px-6 py-3 text-base rounded-md shadow-lg transition-colors"
                    >
                        <Link href="/ask-law">
                            <MessageCircleQuestion className="mr-2 h-5 w-5" />
                            Ask About the Law
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        className="border-white text-white hover:bg-white hover:text-[#1A2B5B] px-6 py-3 text-base rounded-md transition-colors bg-transparent"
                    >
                        <Link href="/connect-lawyer">
                            <Users className="mr-2 h-5 w-5" />
                            Connect with a Lawyer
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        className="border-white text-white hover:bg-white hover:text-[#1A2B5B] px-6 py-3 text-base rounded-md transition-colors bg-transparent"
                    >
                        <Link href="/explore-templates">
                            <FileText className="mr-2 h-5 w-5" />
                            Explore Templates
                        </Link>
                    </Button>
                </div>
            </div>
            <div className='absolute top-0 left-0'>
                <Image
                    src="/file1.png"
                    alt="ADK AI Logo"
                    width={200}
                    height={200}
                    className="h-32 md:h-40 lg:h-56 w-auto"
                />
            </div>
            <div className='absolute top-0 right-0'>
                <Image
                    src="/file2.png"
                    alt="ADK AI Logo"
                    width={200}
                    height={200}
                    className="h-32 md:h-40 lg:h-56 w-auto"
                />
            </div>
            <div className='absolute bottom-0 left-0'>
                <Image
                    src="/file3.png"
                    alt="ADK AI Logo"
                    width={200}
                    height={200}
                    className="h-32 md:h-40 lg:h-56 w-auto"
                />
            </div>
            <div className='absolute bottom-0 right-0'>
                <Image
                    src="/file4.png"
                    alt="ADK AI Logo"
                    width={200}
                    height={200}
                    className="h-32 md:h-40 lg:h-56 w-auto"
                />
            </div>
        </section>
    )
}

export default HeroLander